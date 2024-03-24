import { status } from "@grpc/grpc-js";
import { injected, token } from "brandi";
import validator from "validator";
import { Logger } from "winston";
import {
    USER_DATA_ACCESSOR_TOKEN,
    USER_HAS_USER_ROLE_DATA_ACCESSOR_TOKEN,
    USER_ROLE_DATA_ACCESSOR_TOKEN,
    UserDataAccessor,
    UserHasUserRoleDataAccessor,
    UserRoleDataAccessor,
} from "../../dataaccess/db";
import { ErrorWithStatus, LOGGER_TOKEN } from "../../utils";
import { UserRole } from "../../proto/gen/UserRole";

export interface UserRoleManagementOperator {
    createUserRole(displayName: string, description: string): Promise<UserRole>;
    updateUserRole(userRole: UserRole): Promise<UserRole>;
    deleteUserRole(id: number): Promise<void>;
    addUserRoleToUser(userId: number, userRoleId: number): Promise<void>;
    removeUserRoleFromUser(userId: number, userRoleId: number): Promise<void>;
    getUserRoleListFromUserList(userIdList: number[]): Promise<UserRole[][]>;
}

export class UserRoleManagementOperatorImpl implements UserRoleManagementOperator {
    constructor(
        private readonly userRoleDM: UserRoleDataAccessor,
        private readonly userDM: UserDataAccessor,
        private readonly userHasUserRoleDM: UserHasUserRoleDataAccessor,
        private readonly logger: Logger
    ) { }

    public async createUserRole(displayName: string, description: string): Promise<UserRole> {
        displayName = this.sanitizeUserRoleDisplayName(displayName);
        if (!this.isValidUserRoleDisplayName(displayName)) {
            this.logger.error("invalid user role display name", { displayName });
            throw new ErrorWithStatus("invalid user role display name", status.INVALID_ARGUMENT);
        }

        description = this.sanitizeUserRoleDescription(description);
        if (!this.isValidUserRoleDescription(description)) {
            this.logger.error("invalid user role description", { description });
            throw new ErrorWithStatus("invalid user role description", status.INVALID_ARGUMENT);
        }

        const userRoleId = await this.userRoleDM.createUserRole(displayName, description);
        return {
            id: userRoleId,
            displayName: displayName,
            description: description,
        };
    }

    public async updateUserRole(userRole: UserRole): Promise<UserRole> {
        if (userRole.id === undefined) {
            this.logger.error("user_role.id is required");
            throw new ErrorWithStatus("user_role.id is required", status.INVALID_ARGUMENT);
        }
        const userRoleId = userRole.id;

        if (userRole.displayName !== undefined) {
            userRole.displayName = this.sanitizeUserRoleDisplayName(userRole.displayName);
            if (!this.isValidUserRoleDisplayName(userRole.displayName)) {
                this.logger.error("invalid user role display name", { displayName: userRole.displayName });
                throw new ErrorWithStatus("invalid user role display name", status.INVALID_ARGUMENT);
            }
        }

        if (userRole.description !== undefined) {
            userRole.description = this.sanitizeUserRoleDescription(userRole.description);
            if (!this.isValidUserRoleDescription(userRole.description)) {
                this.logger.error("invalid user role description", { description: userRole.description });
                throw new ErrorWithStatus("invalid user role description", status.INVALID_ARGUMENT);
            }
        }

        return this.userRoleDM.withTransaction(async (dm) => {
            const userRoleRecord = await dm.getUserRoleWithXLock(userRoleId);
            if (userRoleRecord === null) {
                this.logger.error("no user_role with user_role_id found", { userRoleId });
                throw new ErrorWithStatus(`no user role with user_role_id ${userRoleId}`, status.NOT_FOUND);
            }

            if (userRole.displayName !== undefined) {
                userRoleRecord.displayName = userRole.displayName;
            }
            if (userRole.description !== undefined) {
                userRoleRecord.description = userRole.description;
            }

            await dm.updateUserRole(userRoleRecord);
            return userRoleRecord;
        });
    }

    public async deleteUserRole(id: number): Promise<void> {
        await this.userRoleDM.deleteUserRole(id);
    }

    public async addUserRoleToUser(userId: number, userRoleId: number): Promise<void> {
        const userRecord = await this.userDM.getUserByUserId(userId);
        if (userRecord === null) {
            this.logger.error("no user with user_id found", { userId });
            throw new ErrorWithStatus(`no user with user_id ${userId} found`, status.NOT_FOUND);
        }

        const userRoleRecord = await this.userRoleDM.getUserRole(userRoleId);
        if (userRoleRecord === null) {
            this.logger.error("no user role with user_role_id found", { userRoleId });
            throw new ErrorWithStatus(`no user role with user_role_id ${userRoleId} found`, status.NOT_FOUND);
        }

        return this.userHasUserRoleDM.withTransaction(async (dm) => {
            const userHasUserRole = await dm.getUserHasUserRoleWithXLock(userId, userRoleId);
            if (userHasUserRole !== null) {
                this.logger.error("user already has user role", { userId, userRoleId });
                throw new ErrorWithStatus(`user ${userId} already has user role ${userRoleId}`, status.FAILED_PRECONDITION);
            }

            await dm.createUserHasUserRole(userId, userRoleId);
        });
    }

    public async removeUserRoleFromUser(userId: number, userRoleId: number): Promise<void> {
        const userRecord = await this.userDM.getUserByUserId(userId);
        if (userRecord === null) {
            this.logger.error("no user with user_id found", { userId });
            throw new ErrorWithStatus(`no user with user_id ${userId} found`, status.NOT_FOUND);
        }

        const userRoleRecord = await this.userRoleDM.getUserRole(userRoleId);
        if (userRoleRecord === null) {
            this.logger.error("no user role with user_role_id found", { userRoleId });
            throw new ErrorWithStatus(`no user role with user_role_id ${userRoleId} found`, status.NOT_FOUND);
        }

        return this.userHasUserRoleDM.withTransaction(async (dm) => {
            const userHasUserRole = await dm.getUserHasUserRoleWithXLock(userId, userRoleId);
            if (userHasUserRole === null) {
                this.logger.error("user does not have user role", { userId, userRoleId });
                throw new ErrorWithStatus(`user ${userId} does not have user role ${userRoleId}`, status.FAILED_PRECONDITION);
            }

            return await dm.deleteUserHasUserRole(userId, userRoleId);
        });
    }

    public async getUserRoleListFromUserList(userIdList: number[]): Promise<UserRole[][]> {
        return await this.userHasUserRoleDM.getUserRoleListOfUserList(userIdList);
    }

    private sanitizeUserRoleDisplayName(displayName: string): string {
        return validator.escape(validator.trim(displayName));
    }

    private isValidUserRoleDisplayName(displayName: string): boolean {
        return validator.isLength(displayName, { min: 1, max: 256 });
    }

    private sanitizeUserRoleDescription(description: string): string {
        return validator.escape(validator.trim(description));
    }

    private isValidUserRoleDescription(description: string): boolean {
        return validator.isLength(description, { min: 0, max: 256 });
    }
}

injected(
    UserRoleManagementOperatorImpl,
    USER_ROLE_DATA_ACCESSOR_TOKEN,
    USER_DATA_ACCESSOR_TOKEN,
    USER_HAS_USER_ROLE_DATA_ACCESSOR_TOKEN,
    LOGGER_TOKEN
);

export const USER_ROLE_MANAGEMENT_OPERATOR_TOKEN = token<UserRoleManagementOperator>("UserRoleManagementOperator"); 
