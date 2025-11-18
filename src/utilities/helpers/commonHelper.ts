import {  setInitialMdChannels, setInitialFixChannels } from "../../slices/channelSlicer";
import type { ChannelEntry } from "../../slices/channelSlicer";



export const initializeChannels = (dispatch: any, config : any ,  current_user : any) => {
  const initial_md_channels: ChannelEntry = {};
  const initial_fix_channels: ChannelEntry = {};
  
  if(config.is_dse_enabled)
   {
      initial_md_channels["ltp"] = 1;
      initial_md_channels["bbo"] = 1;
      initial_md_channels["dse_md_suspended"] = 1;
      initial_md_channels["news"] = 1;
      initial_md_channels["index"] = 1;
      initial_md_channels["mktevent"] = 1;
      initial_md_channels["dse_md_index_status"] = 1;
      initial_md_channels["mkt_status"] = 1;
      initial_md_channels["adv_dcl"] = 1;
      initial_md_channels["index_chart"] = 1;
      initial_fix_channels['broker_fix_status'] = 1;
      initial_fix_channels['mkt_status'] = 1;
   }
    if(config.is_cse_enabled){
        initial_md_channels["cse_ltp"] = 1;
        initial_md_channels["cse_bbo"] = 1;
        initial_md_channels["news"] = 1;
        initial_md_channels["cse_index"] = 1;
        initial_md_channels["cse_mktevent"] = 1;
        initial_md_channels["mkt_status_cse"] = 1;
        initial_md_channels["cse_adv_dcl"] = 1;
        initial_md_channels["index_chart"] = 1;
        initial_fix_channels['broker_fix_cse_status'] = 1;
        initial_fix_channels['mkt_status_cse'] = 1;
    }
    initial_fix_channels['announcement'] = 1;
    initial_fix_channels['notification_sync'] = 1;
    initial_fix_channels['logout_all'] = 1;
    if(['brokeradmin','adminstrator','brokerexex','brokerccd','brokerit'].includes(current_user.users_roles))
    {
       initial_fix_channels['send_limit'] = 1;
       initial_fix_channels['rms_update'] = 1;
       initial_fix_channels['update_limit'] = 1;
       initial_fix_channels['update_limit'] = 1;
       initial_fix_channels['temp_dealer_assign_req'] = 1;
       initial_fix_channels['temp_dealer_update'] = 1;
       if(!['brokerit','brokerccd'].includes(current_user.users_roles))
        {
            initial_fix_channels['ordr_in'] = 1;
            initial_fix_channels['ordr_out'] = 1;
        }

    }

    dispatch(setInitialMdChannels({ active: initial_md_channels }));
    dispatch(setInitialFixChannels({ active: initial_fix_channels }));
  
}

