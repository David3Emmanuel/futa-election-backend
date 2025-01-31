import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import { ValidationError } from 'class-validator'
import { Response } from 'express'
import { CastError } from 'mongoose'

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()

    if (exception.constructor.name === ValidationError.name) {
      response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: exception.message,
      })
      return
    }

    if (exception.constructor.name === 'CastError') {
      const castError = exception as CastError
      response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Invalid ${castError.kind}: ${castError.value}`,
      })
    }

    if (!(exception instanceof HttpException)) console.error(exception)

    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR

    response
      .status(statusCode)
      .json(
        exception instanceof HttpException
          ? { statusCode, message: exception.getResponse() }
          : { statusCode, message: 'Internal Server Error' },
      )
  }
}
