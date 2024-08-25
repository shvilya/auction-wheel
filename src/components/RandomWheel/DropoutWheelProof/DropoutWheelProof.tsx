import React, { ChangeEvent, FC, Key, useCallback, useState } from 'react';
import './DropoutWheelProof.scss';
import { useSelector } from 'react-redux';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
  Typography,
} from '@material-ui/core';
import { ColDef, XGrid } from '@material-ui/x-grid';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import RadioButtonGroup, { Option } from '../../RadioButtonGroup/RadioButtonGroup';
import PredictionService, { SlotChanceDifference } from '../../../services/PredictionService';
import { RootState } from '../../../reducers';
import { createRandomSlots } from '../../../reducers/Slots/Slots';
import { percentsFormatter } from '../../../utils/common.utils';
import DropoutProof from '../../../assets/pdf/dropout_proof.pdf';

enum SlotsPresetType {
  Random,
  Current,
}

const SLOT_PRESETS_OPTIONS: Option[] = [
  { key: SlotsPresetType.Current, value: 'поточні лоти' },
  { key: SlotsPresetType.Random, value: 'рандомні лоти' },
];

const columns: ColDef[] = [
  {
    headerName: 'Назва',
    field: 'name',
    sortable: true,
    flex: 0.8,
  },
  {
    headerName: 'Сума',
    field: 'amount',
    sortable: true,
    flex: 0.4,
  },
  {
    headerName: 'Звичайне колесо',
    field: 'originalChance',
    sortable: true,
    valueFormatter: percentsFormatter,
    flex: 0.4,
  },
  {
    headerName: 'Вибування',
    field: 'dropoutChance',
    sortable: true,
    valueFormatter: percentsFormatter,
    flex: 0.4,
  },
  {
    headerName: 'Різниця в шансах',
    field: 'chanceDifference',
    sortable: true,
    valueFormatter: percentsFormatter,
    flex: 0.4,
  },
  {
    headerName: 'Перемоги',
    field: 'winsCount',
    sortable: true,
    flex: 0.4,
  },
];

const DropoutWheelProof: FC = () => {
  const { slots } = useSelector((rootReducer: RootState) => rootReducer.slots);
  const [slotsPresetType, setSlotsPresetType] = useState<Key>(SlotsPresetType.Current);
  const [iterations, setIterations] = useState<number>(5000);
  const [chanceDifference, setChanceDifference] = useState<SlotChanceDifference[]>([]);
  const [preserveLogs, setPreserveLogs] = useState<boolean>(false);

  const predictChances = useCallback(() => {
    console.clear();

    const safeIterations = preserveLogs ? Math.min(30, iterations) : iterations;
    const slotsToPredict = slotsPresetType === SlotsPresetType.Current ? slots : createRandomSlots(20, 2000, 10);
    const predictionService = new PredictionService(slotsToPredict, preserveLogs);
    const difference = predictionService.researchDifference(safeIterations);

    setChanceDifference(difference);
  }, [iterations, preserveLogs, slots, slotsPresetType]);

  const handleIterationsChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setIterations(Number(e.target.value));
  }, []);

  const handlePreserveLogsChange = useCallback((e, checked: boolean) => {
    setPreserveLogs(checked);
    setIterations(checked ? 5 : 5000);
  }, []);

  return (
    <div className="dropout-wheel-proof">
      <h2>Шанси на перемогу</h2>
      <p className="warning important">
        Дане колесо ПОВНІСТТІ відповідає звичайному класичному колесу. Чим більша сума лота, тим менше шансів вилетіти і
        тим більше шансів перемогти. Шанси на перемогу в цьому колесі РІВНІ шансам на перемогу у звичайному.
      </p>
      {/* <p>МАТЕМАТИЧЕСКОЕ доказательство, что здесь нет никакого наеба, приведенно ниже:</p>
      <Button size="large" variant="outlined" className="dropout-wheel-proof-pdf-button">
        <a target="_blank" href={DropoutProof} rel="noreferrer">
          Открыть математическое доказательство
        </a>
      </Button> */}
      {/* <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="body1">Симуляция колеса на большом числе прокрутов</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <div>
            <p>
              Данный скрипт симулирует прокруты колеса на выбывание до последнего победителя и выводит разницу с обычным
              колесом. Вы можете рассчитать шансы и убедиться, что разница стремится к нулю при увеличении итераций.
            </p>
            <p className="warning">
              ВНИМАНИЕ! При нажатии на "Рассчитать шансы" сайт может зависнуть на несколько секунд (зависит от
              количества лотов, количества итераций и вашего пк), просто подождите. Но лучше сохраните лоты на всякий,
              если у вас 50+ позиций)
            </p>
            <p className="warning">Максимальное количество итераций при включенных подробных логах - 30.</p>
            <div className="row">
              <RadioButtonGroup
                options={SLOT_PRESETS_OPTIONS}
                activeKey={slotsPresetType}
                onChangeActive={setSlotsPresetType}
              />
              <TextField
                className="iteration-input"
                variant="outlined"
                margin="dense"
                label="кол-во итераций"
                onChange={handleIterationsChange}
                value={iterations}
              />
              <Button variant="contained" color="primary" onClick={predictChances}>
                рассчитать шансы
              </Button>
            </div>
            <FormControlLabel
              control={<Checkbox checked={preserveLogs} onChange={handlePreserveLogsChange} color="primary" />}
              label="Подробные логи итераций"
              className="wheel-controls-checkbox"
            />
            {!!chanceDifference.length && preserveLogs && (
              <p>Чтобы посмотреть логи нажмите F12 -&gt; вкладка "console"</p>
            )}
            <div style={{ height: '50vh' }} className="history-table">
              <XGrid
                rows={chanceDifference}
                columns={columns}
                pagination
                rowHeight={35}
                pageSize={30}
                rowsPerPageOptions={[5, 10, 20, 50, 100]}
                disableSelectionOnClick
                disableColumnMenu
              />
            </div>
          </div>
        </AccordionDetails>
      </Accordion> */}
    </div>
  );
};

export default DropoutWheelProof;
