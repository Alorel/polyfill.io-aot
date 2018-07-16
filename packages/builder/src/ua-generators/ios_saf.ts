import {safariCommonGenerator} from './common/safari-common';

const base = 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) '
  + 'AppleWebKit/604.1.38 (KHTML, like Gecko) Version/%s Mobile/15A356 Safari/604.1';

export = safariCommonGenerator(base);
