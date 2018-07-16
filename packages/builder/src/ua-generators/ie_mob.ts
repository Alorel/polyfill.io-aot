import {Versions} from './versions/index';

//tslint:disable:max-line-length

export = function* uaGenerator(): IterableIterator<string> {
  for (let i = Versions.ie.ie.min; i <= Versions.ie.ie.max; i++) {
    yield `HTC_Touch_3G Mozilla/4.0 (compatible; MSIE 6.0; Windows CE; IEMobile ${i}.0)`;
  }
};
