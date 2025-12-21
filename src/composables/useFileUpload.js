import * as XLS from 'xlsx';

export function useFileUpload(calculationData, expandAccordionTotalCosts) {
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

  return {
    onUpload,
    removeFile
  };
}

