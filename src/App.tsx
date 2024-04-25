import "./App.css";
import { EventDirection, WidgetEventCapability } from "matrix-widget-api";
import {
  MuiCapabilitiesGuard,
  MuiThemeProvider,
  MuiWidgetApiProvider,
} from "@matrix-widget-toolkit/mui";
import { WidgetApiImpl } from "@matrix-widget-toolkit/api";
import { MatrixCapabilities } from "matrix-widget-api";
import Calendar from "./components/Calendar.tsx";

const widgetApiPromise =
  typeof window !== "undefined"
    ? WidgetApiImpl.create({
        capabilities: [],
      })
    : (() => {})();

function App() {
  return (
    <>
      <MuiThemeProvider>
        <MuiWidgetApiProvider widgetApiPromise={widgetApiPromise}>
          <MuiCapabilitiesGuard
            capabilities={[
              WidgetEventCapability.forStateEvent(
                EventDirection.Receive,
                "m.room.member"
              ),
              WidgetEventCapability.forStateEvent(
                EventDirection.Receive,
                "m.room.name"
              ),
              WidgetEventCapability.forRoomEvent(
                EventDirection.Receive,
                "m.room.message"
              ),
              WidgetEventCapability.forRoomEvent(
                EventDirection.Receive,
                "m.reaction"
              ),
              WidgetEventCapability.forRoomEvent(
                EventDirection.Send,
                "m.room.message"
              ),
              WidgetEventCapability.forRoomEvent(
                EventDirection.Send,
                "m.room.redaction"
              ),
              WidgetEventCapability.forStateEvent(
                EventDirection.Send,
                "im.vector.modular.widgets"
              ),
              WidgetEventCapability.forStateEvent(
                EventDirection.Send,
                "m.room.name"
              ),
              "org.matrix.msc2762.timeline:*",
              MatrixCapabilities.MSC3973UserDirectorySearch,
            ]}
          >
            <Calendar />
          </MuiCapabilitiesGuard>
        </MuiWidgetApiProvider>
      </MuiThemeProvider>
    </>
  );
}

export default App;
