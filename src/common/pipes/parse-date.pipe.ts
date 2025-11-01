import {
  PipeTransform,
  Injectable,
  BadRequestException,
} from '@nestjs/common';

/**
 * Parse and validate date string in ISO 8601 format (YYYY-MM-DD)
 * Throws BadRequestException if date format is invalid
 */
@Injectable()
export class ParseDatePipe implements PipeTransform<string, Date> {
  transform(value: string): Date {
    // Validate ISO 8601 date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(value)) {
      throw new BadRequestException(
        'Invalid date format. Expected YYYY-MM-DD',
      );
    }

    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new BadRequestException(
        'Invalid date. Please provide a valid date string',
      );
    }

    return date;
  }
}
