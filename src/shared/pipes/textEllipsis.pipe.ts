import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'textEllipses'
})
export class TextEllipses implements PipeTransform {
    transform(text: string, length: number): string {
        length = length || 50;
        if(text.length <= length) {
            return text;
        } else {
            return `${text.substr(0, length)}...`;
        }
    }
}