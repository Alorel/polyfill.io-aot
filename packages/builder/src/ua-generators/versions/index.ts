import {LazyGetter} from 'lazy-get-decorator';
import theSuperiorMobileOS = require('./android');
import _bb = require('./bb');
import _chrome = require('./chrome');
import ff = require('./firefox');
import _ie = require('./ie');
import _op = require('./opera');
import _opMob = require('./opMob');
import saf = require('./safari');
import _sam = require('./samsung');

//tslint:disable:no-var-requires

/** Lazy getters for polyfill version specs */
export class Versions {
  @LazyGetter()
  public static get android(): typeof theSuperiorMobileOS {
    return require('./android');
  }

  @LazyGetter()
  public static get bb(): typeof _bb {
    return require('./bb');
  }

  @LazyGetter()
  public static get chrome(): typeof _chrome {
    return require('./chrome');
  }

  @LazyGetter()
  public static get firefox(): typeof ff {
    return require('./firefox');
  }

  @LazyGetter()
  public static get ie(): typeof _ie {
    return require('./ie');
  }

  @LazyGetter()
  public static get opMob(): typeof _opMob {
    return require('./opMob');
  }

  @LazyGetter()
  public static get opera(): typeof _op {
    return require('./opera');
  }

  @LazyGetter()
  public static get safari(): typeof saf {
    return require('./safari');
  }

  @LazyGetter()
  public static get samsung(): typeof _sam {
    return require('./samsung');
  }
}
