import { Logger } from "winston";
import {
    UserDataAccessor,
    UserRoleDataAccessor,
    UserPermissionDataAccessor,
    UserListFilterOptions,
    USER_DATA_ACCESSOR_TOKEN,
    USER_PERMISSION_DATA_ACCESSOR_TOKEN,
    USER_ROLE_DATA_ACCESSOR_TOKEN
} from "../dataaccess/db";
import { USER_PASSWORD_MANAGEMENT_OPERATOR_TOKEN, UserPasswordManagementOperator } from "../module/password";
import { USER_PERMISSION_MANAGEMENT_OPERATOR_TOKEN, UserPermissionManagementOperator } from "../module/permission";
import { USER_ROLE_MANAGEMENT_OPERATOR_TOKEN, UserRoleManagementOperator } from "../module/role";
import { USER_MANAGEMENT_OPERATOR_TOKEN, UserManagementOperator } from "../module/user";
import { APPLICATION_CONFIG_TOKEN, ApplicationConfig } from "../config";
import { injected, token } from "brandi";
import { LOGGER_TOKEN } from "../utils";

export interface InitializationJob {
    execute(): Promise<void>;
}

export class InitializationJobImpl implements InitializationJob {
    constructor(
        private readonly userManagementOperator: UserManagementOperator,
        private readonly userPasswordManagementOperator: UserPasswordManagementOperator,
        private readonly userRoleManagementOperator: UserRoleManagementOperator,
        private readonly userPermissionManagementOperator: UserPermissionManagementOperator,
        private readonly userDM: UserDataAccessor,
        private readonly userRoleDM: UserRoleDataAccessor,
        private readonly userPermissionDM: UserPermissionDataAccessor,
        private readonly applicationConfig: ApplicationConfig,
        private readonly logger: Logger
    ) { }

    public async execute(): Promise<void> {
        const totalUserCount = await this.userDM.getUserCount(new UserListFilterOptions());
        if (totalUserCount > 0) {
            this.logger.info("there is at least one user, will skip initialization");
            return;
        }
        const totalUserRoleCount = await this.userRoleDM.getUserRoleCount();
        if (totalUserRoleCount > 0) {
            this.logger.info("there is at least one user role, will skip initialization");
            return;
        }
        const totalUserPermissionCount = await this.userPermissionDM.getUserPermissionCount();
        if (totalUserPermissionCount > 0) {
            this.logger.info("there is at least one user permission, will skip initialization");
            return;
        }

        this.logger.info("there is no user, user role or user permission, will start initialization");

        this.logger.info("creating first user");
        const firstUser = await this.userManagementOperator.createUser(
            this.applicationConfig.firstUserUsername,
            this.applicationConfig.firstUserDisplayName
        );

        this.logger.info("creating first user password");
        const firstUserId = firstUser.id || 0;
        await this.userPasswordManagementOperator.createUserPassword(
            firstUserId,
            this.applicationConfig.firstUserPassword
        );

        this.logger.info("creating first user role");
        const firstUserRole = await this.userRoleManagementOperator.createUserRole(
            this.applicationConfig.firstUserRoleDisplayName,
            this.applicationConfig.firstUserRoleDescription
        );

        this.logger.info("adding first user role to first user");
        const firstUserRoleId = firstUserRole.id || 0;
        await this.userRoleManagementOperator.addUserRoleToUser(firstUserId, firstUserRoleId);

        this.logger.info("creating user permission");
        for (const userPermissionName of this.applicationConfig.firstUserPermissionPermissionNameList) {
            const userPermission = await this.userPermissionManagementOperator.createUserPermission(
                userPermissionName,
                ""
            );

            this.logger.info("adding user permission to first user role");
            const userPermissionId = userPermission.id || 0;
            await this.userPermissionManagementOperator.addUserPermissionToUserRole(firstUserRoleId, userPermissionId);
        }

        this.logger.info("initialization finish");
    }
}

injected(
    InitializationJobImpl,
    USER_MANAGEMENT_OPERATOR_TOKEN,
    USER_PASSWORD_MANAGEMENT_OPERATOR_TOKEN,
    USER_ROLE_MANAGEMENT_OPERATOR_TOKEN,
    USER_PERMISSION_MANAGEMENT_OPERATOR_TOKEN,
    USER_DATA_ACCESSOR_TOKEN,
    USER_ROLE_DATA_ACCESSOR_TOKEN,
    USER_PERMISSION_DATA_ACCESSOR_TOKEN,
    APPLICATION_CONFIG_TOKEN,
    LOGGER_TOKEN
);

export const INITIALIZATION_JOB_TOKEN = token<InitializationJob>("InitializationJob");