import * as moment from 'moment-timezone';

/** Get a formatted Last-modified header string */
export function getLastModified(d: moment.MomentInput = new Date()): string {
  return moment(d)
    .tz('GMT')
    .format('ddd, DD MMM YYYY HH:mm:ss zz');
}
