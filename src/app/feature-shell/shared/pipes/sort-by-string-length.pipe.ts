import { Pipe, PipeTransform } from '@angular/core';
import { cloneDeep } from 'lodash';

@Pipe({
 name: 'sortByStringLength',
 standalone: true
})
export class SortByStringLengthPipe implements PipeTransform {

  // eslint-disable-next-line
  transform(array: any[], property: string): any[] {
    return cloneDeep(array).sort((a, b) => b[property].length - a[property].length);
  }
}