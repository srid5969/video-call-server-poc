/**
 * @name Unprotected NestJS Controller Endpoints
 * @description Identifies controller endpoints that lack @UseGuards or other security decorators
 * @kind problem
 * @problem.severity warning
 * @security-severity 7.0
 * @precision high
 * @id nestjs/unprotected-endpoint
 * @tags security
 *       nestjs
 *       api
 */

import javascript

class ControllerClass extends ClassDeclaration {
  ControllerClass() {
    this.getADecorator().toString().matches("@Controller%")
  }
}

class RouteHandler extends MethodDeclaration {
  RouteHandler() {
    exists(Decorator d |
      d = this.getADecorator() and
      d.toString().regexpMatch("@(Get|Post|Put|Delete|Patch|Options|Head)%")
    )
  }
}

from ControllerClass c, RouteHandler h
where 
  h.getParent() = c and
  not exists(Decorator d |
    d = h.getADecorator() and
    d.toString().regexpMatch("@(UseGuards|UseInterceptors|UseFilters)%")
  )
select h, "Route handler lacks security decorators"

/**
 * @name Hardcoded Secrets in NestJS Configuration
 * @description Detects hardcoded secrets, credentials, or sensitive configuration values
 * @kind problem
 * @problem.severity error
 * @security-severity 9.0
 * @precision high
 * @id nestjs/hardcoded-secrets
 * @tags security
 *       nestjs
 *       configuration
 */

import javascript

from StringLiteral str
where
  str.getFile().getBaseName().regexpMatch(".*\\.(ts|js)$") and
  str.getValue().regexpMatch("(?i).*(password|secret|key|token|credential).*") and
  not str.getValue().regexpMatch("(?i).*(process\\.env\\.|config\\.|environment\\.).*")
select str, "Possible hardcoded secret detected"

/**
 * @name Unsafe Type Validation in DTOs
 * @description Identifies DTOs that might lack proper type validation decorators
 * @kind problem
 * @problem.severity warning
 * @security-severity 6.0
 * @precision medium
 * @id nestjs/unsafe-dto-validation
 * @tags security
 *       nestjs
 *       validation
 */

import javascript

class DTOClass extends ClassDeclaration {
  DTOClass() {
    this.getName().matches("%Dto")
  }
}

from DTOClass dto, PropertyDeclaration prop
where 
  prop.getParent() = dto and
  not exists(Decorator d |
    d = prop.getADecorator() and
    d.toString().regexpMatch("@(IsString|IsNumber|IsBoolean|IsDate|IsObject|ValidateNested)%")
  )
select prop, "DTO property lacks validation decorators"

/**
 * @name Unhandled Promise Rejections
 * @description Detects async methods that don't properly handle potential promise rejections
 * @kind problem
 * @problem.severity warning
 * @security-severity 5.0
 * @precision high
 * @id nestjs/unhandled-promise
 * @tags security
 *       nestjs
 *       async
 */

import javascript

predicate isAsyncFunction(Function f) {
  f.isAsync() or
  exists(ReturnStatement ret |
    ret.getParent*() = f and
    ret.getExpr().getType().getName().matches("Promise<%")
  )
}

from Function f
where
  isAsyncFunction(f) and
  not exists(TryStatement try |
    try.getParent*() = f
  ) and
  not exists(CatchClause catch |
    catch.getParent*() = f
  )
select f, "Async function lacks error handling"

/**
 * @name Missing Rate Limiting
 * @description Identifies public endpoints that don't implement rate limiting
 * @kind problem
 * @problem.severity warning
 * @security-severity 6.0
 * @precision medium
 * @id nestjs/missing-rate-limit
 * @tags security
 *       nestjs
 *       api
 */

import javascript

class PublicEndpoint extends MethodDeclaration {
  PublicEndpoint() {
    exists(Decorator d |
      d = this.getADecorator() and
      d.toString().regexpMatch("@(Public|SkipAuth)%")
    )
  }
}

from PublicEndpoint e
where
  not exists(Decorator d |
    d = e.getADecorator() and
    d.toString().matches("@UseGuards(ThrottlerGuard%")
  )
select e, "Public endpoint lacks rate limiting"

/**
 * @name Insecure Cookie Options
 * @description Detects cookie usage without secure options
 * @kind problem
 * @problem.severity warning
 * @security-severity 7.0
 * @precision high
 * @id nestjs/insecure-cookie
 * @tags security
 *       nestjs
 *       cookies
 */

import javascript

from MethodDeclaration m, CallExpression call
where
  call.getCalleeName().matches("cookie") and
  call.getParent*() = m and
  not exists(ObjectExpr opts |
    opts = call.getArgument(2) and
    exists(Property p |
      p = opts.getAProperty() and
      p.getName() = "secure" and
      p.getInit().getValue() = "true"
    )
  )
select call, "Cookie set without secure options"
