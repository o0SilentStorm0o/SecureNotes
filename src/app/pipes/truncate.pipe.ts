/**
 * @file truncate.pipe.ts
 * @brief Defines a custom Angular pipe for truncating strings.
 */

import { Pipe, PipeTransform } from '@angular/core';

/**
 * @class TruncatePipe
 * @brief Pipe that truncates strings to a specified length and appends ellipsis if longer.
 */
@Pipe({
  name: 'truncate',
  standalone: true
})
export class TruncatePipe implements PipeTransform {
  /**
   * @function transform
   * @brief Truncates the given string if it exceeds the provided limit.
   * @param value The string to be truncated.
   * @param limit The maximum allowed length for the string.
   * @return Truncated string with ellipsis if needed.
   */
  transform(value: string, limit: number = 100): string {
    return value.length > limit ? value.substring(0, limit) + '...' : value;
  }
}
