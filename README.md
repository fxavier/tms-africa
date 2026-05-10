# TMS Africa Backend

Transport Management System backend implemented as a modular monolith with Spring Modulith.

## Stack

- Java 21
- Spring Boot 3.x
- Spring Modulith
- PostgreSQL 16
- Flyway

## Architecture

This project uses internal modules under `pt.xavier.tms`:

- `shared`
- `security`
- `user`
- `vehicle`
- `driver`
- `activity`
- `alert`
- `audit`
- `integration`
- `hr`

## RH/HR Decision

The system no longer depends on an external RH integration as the primary design.
Driver availability and administrative employee data are handled by the internal `hr` module.

The internal HR module intentionally covers only:

- employee function registry
- employee registry
- salary payment records
- paid/unpaid employee status by period

The HR module does not implement full payroll processing, automatic tax calculation,
INSS/IRPS processing, leave management, attendance management, or advanced payroll engines.
