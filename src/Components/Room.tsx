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

export default function Room() {
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

  const widgetURLs = [
    "https://spanner.half-shot.uk/?spannerName=YourSpannerName&spannerId=SomeUniqueId&sendSpannerMsg=true|false",
  ];

  const widgets = ["spanner"];

  const { loading, results, error } = useUserSearchResults(term, 100);

  const handleConferenceNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setName(e.target.value);
  };

  const handleConferenceTopicChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setTopic(e.target.value);
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
    console.log(client.getAccessToken());

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
      addWidgets(res.room_id);
    });
  }

  useEffect(() => {
    console.log(dayjs(endTime).format('HH:mm:ss').toString())
  }, [endTime]);

  /*room_alias_name?: string;
    // Either 'public' or 'private'.
    visibility?: Visibility;
    // The name to give this room.
    name?: string;
    // The topic to give this room.
    topic?: string;
    preset?: Preset;
    power_level_content_override?: {
        ban?: number;
        events?: Record<EventType | string, number>;
        events_default?: number;
        invite?: number;
        kick?: number;
        notifications?: Record<string, number>;
        redact?: number;
        state_default?: number;
        users?: Record<string, number>;
        users_default?: number;
    };
    creation_content?: object;
    initial_state?: ICreateRoomStateEvent[];
    // A list of user IDs to invite to this room.
    invite?: string[];
    invite_3pid?: IInvite3PID[];
    is_direct?: boolean;
    room_version?: string; */

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
          label="Имя конференции"
          variant="outlined"
          onChange={handleConferenceNameChange}
        />
        <TextField
          id="outlined-basic"
          label="Описание (Опционально)"
          variant="outlined"
          onChange={handleConferenceTopicChange}
        />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Stack spacing={2} direction="row">
            <DatePicker
              label="Дата начала"
              value={dayjs(startDate)}
              onChange={(newValue) => setStartDate(newValue?.toString() ?? "")}
            />
            <TimePicker
              label="Время начала"
              value={dayjs(startTime)}
              onChange={(newValue) => setStartTime(newValue?.toString() ?? "")}
            />
          </Stack>
          <Stack spacing={2} direction="row">
            <DatePicker
              label="Дата окончания"
              value={dayjs(endDate)}
              onChange={(newValue) => setEndDate(newValue?.toString() ?? "")}
            />
            <TimePicker
              label="Время окончания"
              value={dayjs(endTime)}
              onChange={(newValue) => setEndTime(newValue?.toString() ?? "")}
            />
          </Stack>
        </LocalizationProvider>
        <Autocomplete
          sx={{ flex: 1 }}
          getOptionLabel={(user) => user.userId}
          // disable built-in filtering
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
              label="Пользователи"
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
            term.length === 0
              ? "Введите текст для поиска пользователей…"
              : "Пользователи не найдены"
          }
          loadingText="Загрузка..."
        />
        <FormControl>
          <InputLabel id="widget-select-label">Виджеты</InputLabel>
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
            Create Room
          </button>
        </form>
      </Stack>
    </>
  );
}
