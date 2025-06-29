import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'issueIid',
  standalone: true,
})
export class IssueIidPipe implements PipeTransform {
  /**
   * iidを#0000形式でフォーマットする
   * @param iid - イシューID
   * @returns フォーマットされたiid文字列
   */
  transform(iid: number): string {
    return `#${iid.toString().padStart(4, '0')}`;
  }
}
