export const getDateFromString = (dateString: string) => {
    // var dateString = '17-09-2013 10:08',
    let dateTimeParts = dateString.split(' ');
    let timeParts = dateTimeParts[1].split(':');
    let dateParts = dateTimeParts[0].split('-');

    let date = new Date(parseInt(dateParts[2]), parseInt(dateParts[1], 10) - 1, parseInt(dateParts[0]), parseInt(timeParts[0]), parseInt(timeParts[1]));

    return date.getTime();
}