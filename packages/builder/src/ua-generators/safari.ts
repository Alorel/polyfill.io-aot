import {safariCommonGenerator} from './common/safari-common';

const base = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_3) '
  + 'AppleWebKit/537.75.14 (KHTML, like Gecko) Version/%s Safari/7046A194A';

export = safariCommonGenerator(base);
