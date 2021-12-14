import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

export const formatDate = (date: string): string => {
  const parseData = parseISO(date);
  const newDate = format(parseData, 'dd MMM yyy', { locale: ptBR });

  return newDate;
};
