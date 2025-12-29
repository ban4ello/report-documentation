import * as XLS from 'xlsx';
import { useToast } from 'primevue/usetoast';

export function useFileUpload(calculationData, expandAccordionTotalCosts) {
  const toast = useToast();
  const onUpload = async ({ event, tableName, accordionIndex }) => {
    const newFile = event.files[0];
    const arrayBuferFile = await newFile.arrayBuffer();
    const wb = XLS.read(arrayBuferFile);
    const sheet = wb.Sheets[wb.SheetNames[0]];

    let consumablesDataRes = [];
    let hardwareDataRes = [];
    let metalDataRes = [];

    const setTableData = (array, formatedRow) => {
      if (formatedRow['Наименование']) {
        array.push({
          quantity: formatedRow['К-во'],
          name: formatedRow['Наименование'],
          price: formatedRow['Стоимость'],
          unitOfMeasurement: formatedRow['ед.изм.'],
          taxPrice: formatedRow['цена НДС'],
          order: formatedRow['№ п/п']
        });
      }
    };

    XLS.utils.sheet_to_json(sheet).forEach((row) => {
      const formatedRow = {};

      Object.keys(row).forEach((key) => {
        formatedRow[key.trim()] = row[key];
      });

      switch (tableName) {
        case 'consumablesDataRes':
          setTableData(consumablesDataRes, formatedRow);
          break;

        case 'hardwareDataRes':
          setTableData(hardwareDataRes, formatedRow);
          break;
        case 'metalDataRes':
          setTableData(metalDataRes, formatedRow);
          break;

        default:
          break;
      }
    });

    switch (tableName) {
      case 'consumablesDataRes':
        calculationData.value.consumablesData = consumablesDataRes;
        break;

      case 'hardwareDataRes':
        calculationData.value.hardwareData = hardwareDataRes;
        break;
      case 'metalDataRes':
        calculationData.value.metalData = metalDataRes;
        break;

      default:
        break;
    }

    expandAccordionTotalCosts.value = [accordionIndex];
  };

  const removeFile = (entity) => {
    calculationData.value[entity] = [];
  };

  /**
   * Парсит строку из буфера и создает массив объектов для таблицы
   * @param {string} bufferText - Текст из буфера обмена (разделенный табуляциями и переносами строк)
   * @returns {Array} Массив объектов с полями: order, name, unitOfMeasurement, quantity, taxPrice, price
   */
  const parseBufferToTableData = (bufferText) => {
    if (!bufferText || typeof bufferText !== 'string') {
      return [];
    }

    const lines = bufferText
      .split(/\r?\n/) // Разделяем по переносам строк (поддерживаем \n и \r\n)
      .map((line) => line.trim()) // Убираем пробелы в начале и конце
      .filter((line) => line.length > 0); // Убираем пустые строки

    const result = [];

    lines.forEach((line) => {
      const columns = line.split(/\t+/); // Разделяем по табуляциям (может быть несколько подряд)

      // Проверяем, что есть минимум 6 колонок
      if (columns.length >= 6) {
        const order = columns[0].trim();
        const name = columns[1].trim();
        const unitOfMeasurement = columns[2].trim();
        const quantity = columns[3].trim();
        const taxPrice = columns[4].trim();
        const price = columns[5].trim();

        // Добавляем только если есть хотя бы номер и наименование
        if (order && name) {
          result.push({
            order: order,
            name: name,
            unitOfMeasurement: unitOfMeasurement,
            quantity: quantity,
            taxPrice: taxPrice,
            price: price
          });
        }
      }
    });

    return result;
  };

  const pasteFromBuffer = async (entity) => {
    try {
      const buffer = await navigator.clipboard.readText();

      // Проверяем, что буфер не пустой
      if (!buffer || !buffer.trim()) {
        toast.add({
          severity: 'error',
          summary: 'Ошибка',
          detail: 'Буфер обмена пуст или содержит невалидные данные',
          life: 3000
        });
        return;
      }

      const parsedData = parseBufferToTableData(buffer);

      // Проверяем, что данные были успешно распарсены
      if (parsedData.length === 0) {
        toast.add({
          severity: 'error',
          summary: 'Ошибка',
          detail:
            'Не удалось распарсить данные из буфера. Убедитесь, что данные разделены табуляцией и содержат 6 колонок: № п/п, Наименование, ед.изм., К-во, цена НДС, Стоимость',
          life: 5000
        });
        return;
      }

      // Определяем accordionIndex в зависимости от entity
      let accordionIndex = 0;
      let entityName = '';

      switch (entity) {
        case 'consumablesData':
          accordionIndex = 0;
          entityName = 'Расходники';
          break;
        case 'hardwareData':
          accordionIndex = 1;
          entityName = 'Метизы';
          break;
        case 'metalData':
          accordionIndex = 2;
          entityName = 'Металл';
          break;
        default:
          break;
      }

      // Устанавливаем данные в calculationData
      switch (entity) {
        case 'consumablesData':
          calculationData.value.consumablesData = parsedData;
          break;
        case 'hardwareData':
          calculationData.value.hardwareData = parsedData;
          break;
        case 'metalData':
          calculationData.value.metalData = parsedData;
          break;
        default:
          break;
      }

      expandAccordionTotalCosts.value = [accordionIndex];

      toast.add({
        severity: 'success',
        summary: 'Успешно',
        detail: `Добавлено ${parsedData.length} записей в раздел "${entityName}"`,
        life: 3000
      });
    } catch (error) {
      console.error('Error in pasteFromBuffer:', error);
      toast.add({
        severity: 'error',
        summary: 'Ошибка',
        detail: 'Произошла ошибка при вставке данных из буфера',
        life: 3000
      });
    }
  };

  return {
    onUpload,
    removeFile,
    pasteFromBuffer
  };
}
