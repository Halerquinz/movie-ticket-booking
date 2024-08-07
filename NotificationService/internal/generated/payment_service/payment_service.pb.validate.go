// Code generated by protoc-gen-validate. DO NOT EDIT.
// source: payment_service/payment_service.proto

package payment_service

import (
	"bytes"
	"errors"
	"fmt"
	"net"
	"net/mail"
	"net/url"
	"regexp"
	"sort"
	"strings"
	"time"
	"unicode/utf8"

	"google.golang.org/protobuf/types/known/anypb"
)

// ensure the imports are used
var (
	_ = bytes.MinRead
	_ = errors.New("")
	_ = fmt.Print
	_ = utf8.UTFMax
	_ = (*regexp.Regexp)(nil)
	_ = (*strings.Reader)(nil)
	_ = net.IPv4len
	_ = time.Duration(0)
	_ = (*url.URL)(nil)
	_ = (*mail.Address)(nil)
	_ = anypb.Any{}
	_ = sort.Sort
)

// Validate checks the field values on PaymentTransactionStatus with the rules
// defined in the proto definition for this message. If any rules are
// violated, the first error encountered is returned, or nil if there are no violations.
func (m *PaymentTransactionStatus) Validate() error {
	return m.validate(false)
}

// ValidateAll checks the field values on PaymentTransactionStatus with the
// rules defined in the proto definition for this message. If any rules are
// violated, the result is a list of violation errors wrapped in
// PaymentTransactionStatusMultiError, or nil if none found.
func (m *PaymentTransactionStatus) ValidateAll() error {
	return m.validate(true)
}

func (m *PaymentTransactionStatus) validate(all bool) error {
	if m == nil {
		return nil
	}

	var errors []error

	if len(errors) > 0 {
		return PaymentTransactionStatusMultiError(errors)
	}

	return nil
}

// PaymentTransactionStatusMultiError is an error wrapping multiple validation
// errors returned by PaymentTransactionStatus.ValidateAll() if the designated
// constraints aren't met.
type PaymentTransactionStatusMultiError []error

// Error returns a concatenation of all the error messages it wraps.
func (m PaymentTransactionStatusMultiError) Error() string {
	var msgs []string
	for _, err := range m {
		msgs = append(msgs, err.Error())
	}
	return strings.Join(msgs, "; ")
}

// AllErrors returns a list of validation violation errors.
func (m PaymentTransactionStatusMultiError) AllErrors() []error { return m }

// PaymentTransactionStatusValidationError is the validation error returned by
// PaymentTransactionStatus.Validate if the designated constraints aren't met.
type PaymentTransactionStatusValidationError struct {
	field  string
	reason string
	cause  error
	key    bool
}

// Field function returns field value.
func (e PaymentTransactionStatusValidationError) Field() string { return e.field }

// Reason function returns reason value.
func (e PaymentTransactionStatusValidationError) Reason() string { return e.reason }

// Cause function returns cause value.
func (e PaymentTransactionStatusValidationError) Cause() error { return e.cause }

// Key function returns key value.
func (e PaymentTransactionStatusValidationError) Key() bool { return e.key }

// ErrorName returns error name.
func (e PaymentTransactionStatusValidationError) ErrorName() string {
	return "PaymentTransactionStatusValidationError"
}

// Error satisfies the builtin error interface
func (e PaymentTransactionStatusValidationError) Error() string {
	cause := ""
	if e.cause != nil {
		cause = fmt.Sprintf(" | caused by: %v", e.cause)
	}

	key := ""
	if e.key {
		key = "key for "
	}

	return fmt.Sprintf(
		"invalid %sPaymentTransactionStatus.%s: %s%s",
		key,
		e.field,
		e.reason,
		cause)
}

var _ error = PaymentTransactionStatusValidationError{}

var _ interface {
	Field() string
	Reason() string
	Key() bool
	Cause() error
	ErrorName() string
} = PaymentTransactionStatusValidationError{}

// Validate checks the field values on PaymentTransaction with the rules
// defined in the proto definition for this message. If any rules are
// violated, the first error encountered is returned, or nil if there are no violations.
func (m *PaymentTransaction) Validate() error {
	return m.validate(false)
}

// ValidateAll checks the field values on PaymentTransaction with the rules
// defined in the proto definition for this message. If any rules are
// violated, the result is a list of violation errors wrapped in
// PaymentTransactionMultiError, or nil if none found.
func (m *PaymentTransaction) ValidateAll() error {
	return m.validate(true)
}

func (m *PaymentTransaction) validate(all bool) error {
	if m == nil {
		return nil
	}

	var errors []error

	// no validation rules for Id

	// no validation rules for OfBookingId

	// no validation rules for RequestTime

	// no validation rules for UpdateTime

	// no validation rules for Status

	if len(errors) > 0 {
		return PaymentTransactionMultiError(errors)
	}

	return nil
}

// PaymentTransactionMultiError is an error wrapping multiple validation errors
// returned by PaymentTransaction.ValidateAll() if the designated constraints
// aren't met.
type PaymentTransactionMultiError []error

// Error returns a concatenation of all the error messages it wraps.
func (m PaymentTransactionMultiError) Error() string {
	var msgs []string
	for _, err := range m {
		msgs = append(msgs, err.Error())
	}
	return strings.Join(msgs, "; ")
}

// AllErrors returns a list of validation violation errors.
func (m PaymentTransactionMultiError) AllErrors() []error { return m }

// PaymentTransactionValidationError is the validation error returned by
// PaymentTransaction.Validate if the designated constraints aren't met.
type PaymentTransactionValidationError struct {
	field  string
	reason string
	cause  error
	key    bool
}

// Field function returns field value.
func (e PaymentTransactionValidationError) Field() string { return e.field }

// Reason function returns reason value.
func (e PaymentTransactionValidationError) Reason() string { return e.reason }

// Cause function returns cause value.
func (e PaymentTransactionValidationError) Cause() error { return e.cause }

// Key function returns key value.
func (e PaymentTransactionValidationError) Key() bool { return e.key }

// ErrorName returns error name.
func (e PaymentTransactionValidationError) ErrorName() string {
	return "PaymentTransactionValidationError"
}

// Error satisfies the builtin error interface
func (e PaymentTransactionValidationError) Error() string {
	cause := ""
	if e.cause != nil {
		cause = fmt.Sprintf(" | caused by: %v", e.cause)
	}

	key := ""
	if e.key {
		key = "key for "
	}

	return fmt.Sprintf(
		"invalid %sPaymentTransaction.%s: %s%s",
		key,
		e.field,
		e.reason,
		cause)
}

var _ error = PaymentTransactionValidationError{}

var _ interface {
	Field() string
	Reason() string
	Key() bool
	Cause() error
	ErrorName() string
} = PaymentTransactionValidationError{}

// Validate checks the field values on CreatePaymentTransactionRequest with the
// rules defined in the proto definition for this message. If any rules are
// violated, the first error encountered is returned, or nil if there are no violations.
func (m *CreatePaymentTransactionRequest) Validate() error {
	return m.validate(false)
}

// ValidateAll checks the field values on CreatePaymentTransactionRequest with
// the rules defined in the proto definition for this message. If any rules
// are violated, the result is a list of violation errors wrapped in
// CreatePaymentTransactionRequestMultiError, or nil if none found.
func (m *CreatePaymentTransactionRequest) ValidateAll() error {
	return m.validate(true)
}

func (m *CreatePaymentTransactionRequest) validate(all bool) error {
	if m == nil {
		return nil
	}

	var errors []error

	// no validation rules for BookingId

	// no validation rules for UserId

	if len(errors) > 0 {
		return CreatePaymentTransactionRequestMultiError(errors)
	}

	return nil
}

// CreatePaymentTransactionRequestMultiError is an error wrapping multiple
// validation errors returned by CreatePaymentTransactionRequest.ValidateAll()
// if the designated constraints aren't met.
type CreatePaymentTransactionRequestMultiError []error

// Error returns a concatenation of all the error messages it wraps.
func (m CreatePaymentTransactionRequestMultiError) Error() string {
	var msgs []string
	for _, err := range m {
		msgs = append(msgs, err.Error())
	}
	return strings.Join(msgs, "; ")
}

// AllErrors returns a list of validation violation errors.
func (m CreatePaymentTransactionRequestMultiError) AllErrors() []error { return m }

// CreatePaymentTransactionRequestValidationError is the validation error
// returned by CreatePaymentTransactionRequest.Validate if the designated
// constraints aren't met.
type CreatePaymentTransactionRequestValidationError struct {
	field  string
	reason string
	cause  error
	key    bool
}

// Field function returns field value.
func (e CreatePaymentTransactionRequestValidationError) Field() string { return e.field }

// Reason function returns reason value.
func (e CreatePaymentTransactionRequestValidationError) Reason() string { return e.reason }

// Cause function returns cause value.
func (e CreatePaymentTransactionRequestValidationError) Cause() error { return e.cause }

// Key function returns key value.
func (e CreatePaymentTransactionRequestValidationError) Key() bool { return e.key }

// ErrorName returns error name.
func (e CreatePaymentTransactionRequestValidationError) ErrorName() string {
	return "CreatePaymentTransactionRequestValidationError"
}

// Error satisfies the builtin error interface
func (e CreatePaymentTransactionRequestValidationError) Error() string {
	cause := ""
	if e.cause != nil {
		cause = fmt.Sprintf(" | caused by: %v", e.cause)
	}

	key := ""
	if e.key {
		key = "key for "
	}

	return fmt.Sprintf(
		"invalid %sCreatePaymentTransactionRequest.%s: %s%s",
		key,
		e.field,
		e.reason,
		cause)
}

var _ error = CreatePaymentTransactionRequestValidationError{}

var _ interface {
	Field() string
	Reason() string
	Key() bool
	Cause() error
	ErrorName() string
} = CreatePaymentTransactionRequestValidationError{}

// Validate checks the field values on CreatePaymentTransactionResponse with
// the rules defined in the proto definition for this message. If any rules
// are violated, the first error encountered is returned, or nil if there are
// no violations.
func (m *CreatePaymentTransactionResponse) Validate() error {
	return m.validate(false)
}

// ValidateAll checks the field values on CreatePaymentTransactionResponse with
// the rules defined in the proto definition for this message. If any rules
// are violated, the result is a list of violation errors wrapped in
// CreatePaymentTransactionResponseMultiError, or nil if none found.
func (m *CreatePaymentTransactionResponse) ValidateAll() error {
	return m.validate(true)
}

func (m *CreatePaymentTransactionResponse) validate(all bool) error {
	if m == nil {
		return nil
	}

	var errors []error

	// no validation rules for CheckoutUrl

	if len(errors) > 0 {
		return CreatePaymentTransactionResponseMultiError(errors)
	}

	return nil
}

// CreatePaymentTransactionResponseMultiError is an error wrapping multiple
// validation errors returned by
// CreatePaymentTransactionResponse.ValidateAll() if the designated
// constraints aren't met.
type CreatePaymentTransactionResponseMultiError []error

// Error returns a concatenation of all the error messages it wraps.
func (m CreatePaymentTransactionResponseMultiError) Error() string {
	var msgs []string
	for _, err := range m {
		msgs = append(msgs, err.Error())
	}
	return strings.Join(msgs, "; ")
}

// AllErrors returns a list of validation violation errors.
func (m CreatePaymentTransactionResponseMultiError) AllErrors() []error { return m }

// CreatePaymentTransactionResponseValidationError is the validation error
// returned by CreatePaymentTransactionResponse.Validate if the designated
// constraints aren't met.
type CreatePaymentTransactionResponseValidationError struct {
	field  string
	reason string
	cause  error
	key    bool
}

// Field function returns field value.
func (e CreatePaymentTransactionResponseValidationError) Field() string { return e.field }

// Reason function returns reason value.
func (e CreatePaymentTransactionResponseValidationError) Reason() string { return e.reason }

// Cause function returns cause value.
func (e CreatePaymentTransactionResponseValidationError) Cause() error { return e.cause }

// Key function returns key value.
func (e CreatePaymentTransactionResponseValidationError) Key() bool { return e.key }

// ErrorName returns error name.
func (e CreatePaymentTransactionResponseValidationError) ErrorName() string {
	return "CreatePaymentTransactionResponseValidationError"
}

// Error satisfies the builtin error interface
func (e CreatePaymentTransactionResponseValidationError) Error() string {
	cause := ""
	if e.cause != nil {
		cause = fmt.Sprintf(" | caused by: %v", e.cause)
	}

	key := ""
	if e.key {
		key = "key for "
	}

	return fmt.Sprintf(
		"invalid %sCreatePaymentTransactionResponse.%s: %s%s",
		key,
		e.field,
		e.reason,
		cause)
}

var _ error = CreatePaymentTransactionResponseValidationError{}

var _ interface {
	Field() string
	Reason() string
	Key() bool
	Cause() error
	ErrorName() string
} = CreatePaymentTransactionResponseValidationError{}

// Validate checks the field values on CancelPaymentTransactionRequest with the
// rules defined in the proto definition for this message. If any rules are
// violated, the first error encountered is returned, or nil if there are no violations.
func (m *CancelPaymentTransactionRequest) Validate() error {
	return m.validate(false)
}

// ValidateAll checks the field values on CancelPaymentTransactionRequest with
// the rules defined in the proto definition for this message. If any rules
// are violated, the result is a list of violation errors wrapped in
// CancelPaymentTransactionRequestMultiError, or nil if none found.
func (m *CancelPaymentTransactionRequest) ValidateAll() error {
	return m.validate(true)
}

func (m *CancelPaymentTransactionRequest) validate(all bool) error {
	if m == nil {
		return nil
	}

	var errors []error

	// no validation rules for BookingId

	// no validation rules for UserId

	if len(errors) > 0 {
		return CancelPaymentTransactionRequestMultiError(errors)
	}

	return nil
}

// CancelPaymentTransactionRequestMultiError is an error wrapping multiple
// validation errors returned by CancelPaymentTransactionRequest.ValidateAll()
// if the designated constraints aren't met.
type CancelPaymentTransactionRequestMultiError []error

// Error returns a concatenation of all the error messages it wraps.
func (m CancelPaymentTransactionRequestMultiError) Error() string {
	var msgs []string
	for _, err := range m {
		msgs = append(msgs, err.Error())
	}
	return strings.Join(msgs, "; ")
}

// AllErrors returns a list of validation violation errors.
func (m CancelPaymentTransactionRequestMultiError) AllErrors() []error { return m }

// CancelPaymentTransactionRequestValidationError is the validation error
// returned by CancelPaymentTransactionRequest.Validate if the designated
// constraints aren't met.
type CancelPaymentTransactionRequestValidationError struct {
	field  string
	reason string
	cause  error
	key    bool
}

// Field function returns field value.
func (e CancelPaymentTransactionRequestValidationError) Field() string { return e.field }

// Reason function returns reason value.
func (e CancelPaymentTransactionRequestValidationError) Reason() string { return e.reason }

// Cause function returns cause value.
func (e CancelPaymentTransactionRequestValidationError) Cause() error { return e.cause }

// Key function returns key value.
func (e CancelPaymentTransactionRequestValidationError) Key() bool { return e.key }

// ErrorName returns error name.
func (e CancelPaymentTransactionRequestValidationError) ErrorName() string {
	return "CancelPaymentTransactionRequestValidationError"
}

// Error satisfies the builtin error interface
func (e CancelPaymentTransactionRequestValidationError) Error() string {
	cause := ""
	if e.cause != nil {
		cause = fmt.Sprintf(" | caused by: %v", e.cause)
	}

	key := ""
	if e.key {
		key = "key for "
	}

	return fmt.Sprintf(
		"invalid %sCancelPaymentTransactionRequest.%s: %s%s",
		key,
		e.field,
		e.reason,
		cause)
}

var _ error = CancelPaymentTransactionRequestValidationError{}

var _ interface {
	Field() string
	Reason() string
	Key() bool
	Cause() error
	ErrorName() string
} = CancelPaymentTransactionRequestValidationError{}

// Validate checks the field values on CancelPaymentTransactionResponse with
// the rules defined in the proto definition for this message. If any rules
// are violated, the first error encountered is returned, or nil if there are
// no violations.
func (m *CancelPaymentTransactionResponse) Validate() error {
	return m.validate(false)
}

// ValidateAll checks the field values on CancelPaymentTransactionResponse with
// the rules defined in the proto definition for this message. If any rules
// are violated, the result is a list of violation errors wrapped in
// CancelPaymentTransactionResponseMultiError, or nil if none found.
func (m *CancelPaymentTransactionResponse) ValidateAll() error {
	return m.validate(true)
}

func (m *CancelPaymentTransactionResponse) validate(all bool) error {
	if m == nil {
		return nil
	}

	var errors []error

	if len(errors) > 0 {
		return CancelPaymentTransactionResponseMultiError(errors)
	}

	return nil
}

// CancelPaymentTransactionResponseMultiError is an error wrapping multiple
// validation errors returned by
// CancelPaymentTransactionResponse.ValidateAll() if the designated
// constraints aren't met.
type CancelPaymentTransactionResponseMultiError []error

// Error returns a concatenation of all the error messages it wraps.
func (m CancelPaymentTransactionResponseMultiError) Error() string {
	var msgs []string
	for _, err := range m {
		msgs = append(msgs, err.Error())
	}
	return strings.Join(msgs, "; ")
}

// AllErrors returns a list of validation violation errors.
func (m CancelPaymentTransactionResponseMultiError) AllErrors() []error { return m }

// CancelPaymentTransactionResponseValidationError is the validation error
// returned by CancelPaymentTransactionResponse.Validate if the designated
// constraints aren't met.
type CancelPaymentTransactionResponseValidationError struct {
	field  string
	reason string
	cause  error
	key    bool
}

// Field function returns field value.
func (e CancelPaymentTransactionResponseValidationError) Field() string { return e.field }

// Reason function returns reason value.
func (e CancelPaymentTransactionResponseValidationError) Reason() string { return e.reason }

// Cause function returns cause value.
func (e CancelPaymentTransactionResponseValidationError) Cause() error { return e.cause }

// Key function returns key value.
func (e CancelPaymentTransactionResponseValidationError) Key() bool { return e.key }

// ErrorName returns error name.
func (e CancelPaymentTransactionResponseValidationError) ErrorName() string {
	return "CancelPaymentTransactionResponseValidationError"
}

// Error satisfies the builtin error interface
func (e CancelPaymentTransactionResponseValidationError) Error() string {
	cause := ""
	if e.cause != nil {
		cause = fmt.Sprintf(" | caused by: %v", e.cause)
	}

	key := ""
	if e.key {
		key = "key for "
	}

	return fmt.Sprintf(
		"invalid %sCancelPaymentTransactionResponse.%s: %s%s",
		key,
		e.field,
		e.reason,
		cause)
}

var _ error = CancelPaymentTransactionResponseValidationError{}

var _ interface {
	Field() string
	Reason() string
	Key() bool
	Cause() error
	ErrorName() string
} = CancelPaymentTransactionResponseValidationError{}
