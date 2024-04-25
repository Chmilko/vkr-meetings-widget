import * as sdk from "matrix-js-sdk";
import { useWidgetApi } from "@matrix-widget-toolkit/react";
import { v4 as uuidv4 } from "uuid";
import {
  TextField,
  Autocomplete,
  CircularProgress,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  Box,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import Stack from "@mui/material/Stack";
import { useState, useEffect, ChangeEvent } from "react";
import { ElementAvatar } from "@matrix-widget-toolkit/mui";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { CalendarEvent } from "./Calendar";

const USERS = "Пользователи";
const CONFERENCE_NAME = "Имя конференции";
const DESCRIPTION = "Описание (Опционально)";
const START_DATE = "Дата начала";
const END_DATE = "Дата окончания";
const START_TIME = "Время начала";
const END_TIME = "Время окончания";
const TEXT_INPUT_MESSAGE = "Введите текст для поиска пользователей…";
const INPUT_NOT_FOUND = "Пользователи не найдены";
const LOADING = "Загрузка...";
const WIDGETS_BUTTON = "Виджеты";
const CREATE_ROOM_BUTTON = "Создать комнату";

const widgetURLs = [
  "https://spanner.half-shot.uk/?spannerName=YourSpannerName&spannerId=SomeUniqueId&sendSpannerMsg=true|false",
];

const widgets = ["spanner"];

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  bgcolor: "background.paper",
  border: "2px solid #000",
  p: 4,
};

type RoomProps = {
  addEvents: React.Dispatch<React.SetStateAction<CalendarEvent[]>>
}

export default function Room({addEvents}: RoomProps) {
  const [name, setName] = useState<string>("");
  const [selected, setSelected] = useState<SearchResults>([]);
  const [topic, setTopic] = useState<string>("");
  const [term, setTerm] = useState<string>("");
  const [widgetName, setWidgetName] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");

  const widgetApi = useWidgetApi();

  const { loading, results, error } = useUserSearchResults(term, 100);

  const handleConferenceNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    setName(event.target.value);
  };

  const handleConferenceTopicChange = (event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    setTopic(event.target.value);
  };

  const handleWidgetsChange = (event: SelectChangeEvent<typeof widgetName>) => {
    const {
      target: { value },
    } = event;
    setWidgetName(typeof value === "string" ? value.split(",") : value);
  };

  const client = sdk.createClient({
    baseUrl: "https://matrix-client.matrix.org",
    accessToken: "syt_a292YWxldmNobWlsa28_MaHgCgFuAkfIlCNJrOCs_2oyKyO",
    userId: "@kovalevchmilko:matrix.org",
  });

  var uuid = uuidv4();

  function createNewRoom(event: any) {
    event.preventDefault();

    const roomId = client.createRoom({
      room_alias_name: uuid,
      visibility: sdk.Visibility.Public,
      preset: sdk.Preset.PrivateChat,
      power_level_content_override: {
        events: {
          "im.vector.modular.widgets": 50,
        },
      },
      name: name,
      topic: topic,
      invite: selected.map((item) => item.userId),
    });

    roomId.then((res) => {
      const newEvent: CalendarEvent = {
        title: name,
        start: dayjs(startDate).format('YYYY-MM-DD').toString() + 'T' + dayjs(startTime).format('HH:mm:ss').toString(),
        end: dayjs(endDate).format('YYYY-MM-DD').toString() + 'T' + dayjs(endTime).format('HH:mm:ss').toString()
      };

      addEvents(prevState => [...prevState, newEvent]);

      addWidgets(res.room_id);
    });
  }

  type SearchResults = Array<{
    userId: string;
    displayName?: string;
    avatarUrl?: string;
  }>;

  function useUserSearchResults(
    input: string,
    delay: number
  ): {
    loading: boolean;
    results: SearchResults;
    error?: Error;
  } {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<undefined | Error>();
    const [results, setResults] = useState<SearchResults>([]);

    useEffect(() => {
      let ignore = false;

      async function fetchResults() {
        const { results } = await widgetApi.searchUserDirectory(input);

        if (!ignore) {
          setResults(results);
          setError(undefined);
          setLoading(false);
        }
      }

      setLoading(true);
      const timer = setTimeout(fetchResults, delay);

      return () => {
        clearTimeout(timer);
        ignore = true;
      };
    }, [delay, input, widgetApi]);

    return {
      loading,
      results,
      error,
    };
  }

  async function addWidgets(roomId: string) {
    await widgetApi.sendStateEvent(
      "im.vector.modular.widgets",
      {
        type: "m.custom",
        url: "https://spanner.half-shot.uk/?spannerName=YourSpannerName&spannerId=SomeUniqueId&sendSpannerMsg=true|false",
        name: "spanner",
      },
      {
        roomId: roomId,
        stateKey: uuidv4(),
      }
    );
  }

  return (
    <>
      <Stack spacing={2} sx={style}>
        <TextField
          id="outlined-basic"
          label={CONFERENCE_NAME}
          variant="outlined"
          onChange={handleConferenceNameChange}
        />
        <TextField
          id="outlined-basic"
          label={DESCRIPTION}
          variant="outlined"
          onChange={handleConferenceTopicChange}
        />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Stack spacing={2} direction="row">
            <DatePicker
              label={START_DATE}
              value={dayjs(startDate)}
              onChange={(newValue) => setStartDate(newValue?.toString() ?? "")}
            />
            <TimePicker
              label={START_TIME}
              value={dayjs(startTime)}
              onChange={(newValue) => setStartTime(newValue?.toString() ?? "")}
            />
          </Stack>
          <Stack spacing={2} direction="row">
            <DatePicker
              label={END_DATE}
              value={dayjs(endDate)}
              onChange={(newValue) => setEndDate(newValue?.toString() ?? "")}
            />
            <TimePicker
              label={END_TIME}
              value={dayjs(endTime)}
              onChange={(newValue) => setEndTime(newValue?.toString() ?? "")}
            />
          </Stack>
        </LocalizationProvider>
        <Autocomplete
          sx={{ flex: 1 }}
          getOptionLabel={(user) => user.userId}
          filterOptions={(x) => x}
          options={results}
          includeInputInList
          filterSelectedOptions
          value={selected}
          onChange={(_, value) => setSelected(value)}
          onInputChange={(_, value) => {
            setTerm(value);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label={USERS}
              size="medium"
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loading && <CircularProgress color="inherit" size={20} />}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
          renderOption={(props, option) => (
            <ListItem {...props}>
              <ListItemIcon sx={{ mr: 1, minWidth: 0 }}>
                <ElementAvatar
                  userId={option.userId}
                  displayName={option.displayName}
                  avatarUrl={option.avatarUrl}
                />
              </ListItemIcon>

              <ListItemText primary={option.displayName ?? option.userId} />
            </ListItem>
          )}
          disablePortal
          multiple
          loading={loading}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                avatar={
                  <ElementAvatar
                    userId={option.userId}
                    displayName={option.displayName}
                    avatarUrl={option.avatarUrl}
                  />
                }
                label={option.displayName ?? option.userId}
                {...getTagProps({ index })}
              />
            ))
          }
          noOptionsText={
            term.length === 0 ? TEXT_INPUT_MESSAGE : INPUT_NOT_FOUND
          }
          loadingText={LOADING}
        />
        <FormControl>
          <InputLabel id="widget-select-label">{WIDGETS_BUTTON}</InputLabel>
          <Select
            labelId="widget-select-label"
            id="widget-select"
            multiple
            value={widgetName}
            onChange={handleWidgetsChange}
            input={<OutlinedInput id="widget-select-id" label="Виджеты" />}
            renderValue={(selected) => (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={value} />
                ))}
              </Box>
            )}
          >
            {widgets.map((widgets) => (
              <MenuItem key={widgets} value={widgets}>
                {widgets}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <form onSubmit={createNewRoom}>
          <button className="mt-2 bg-black text-white p-2 border border-black hover:bg-white hover:text-black">
            {CREATE_ROOM_BUTTON}
          </button>
        </form>
      </Stack>
    </>
  );
}
