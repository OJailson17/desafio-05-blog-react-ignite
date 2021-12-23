import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

export const formatDate = (date: string, hour?: boolean): string => {
  if (date) {
    const parseData = parseISO(date);

    let newDate;

    if (hour) {
      newDate = format(parseData, "dd MMM yyy, 'às' HH:mm", {
        locale: ptBR,
      });
    } else {
      newDate = format(parseData, 'dd MMM yyy', {
        locale: ptBR,
      });
    }

    return newDate;
  }

  return '21 dez 2021';
};
