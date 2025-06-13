import { Epic } from 'redux-observable';
import { of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { ImmutableReduxState } from '@c3/ui/UiSdlConnected';
import { UiSdlReduxAction, UiSdlActionsObservable } from '@c3/types';
import { getFormFieldValuesFromState } from '@c3/ui/UiSdlFormBase';
import { mergeArgumentsAction, requestDataAction } from '@c3/ui/UiSdlDataRedux';

export const epic: Epic<UiSdlReduxAction, UiSdlReduxAction, ImmutableReduxState> = (
  actionStream: UiSdlActionsObservable,
  stateStream: UiSdlActionsObservable
): UiSdlActionsObservable => {
  return actionStream.pipe(
    mergeMap((action: UiSdlReduxAction) => {
      const state = stateStream.value;
      const { componentId } = action.payload;
      
      // Get selected values from filter panel
      const formFieldValues = getFormFieldValuesFromState(componentId, state);
      const dateRange = formFieldValues?.date?.value;
      const siteId = formFieldValues?.siteId?.value;
      
      if (!dateRange || !siteId) return EMPTY;

      // Format date range for timeHorizon
      const timeHorizon = `${dateRange[0]}:${dateRange[1]}`;
      
      // Define data source ID
      const metricTileDataSpecId = 'Reposonauts.SiteOptEfficiencyMetricTile_dataSpec_historicSparkline_ds';
      
      // Update Metric Tile arguments and request data
      return of(
        mergeArgumentsAction(
          metricTileDataSpecId,
          {
            historicSparkline: {
              entityId: siteId,
              timeHorizon: timeHorizon,
            }
          },
          metricTileDataSpecId
        ),
        requestDataAction(metricTileDataSpecId)
      );
    })
  );
};
