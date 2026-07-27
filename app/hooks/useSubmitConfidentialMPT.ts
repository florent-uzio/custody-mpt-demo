import {
  proposeConfidentialMPTConvert,
  proposeConfidentialMPTConvertBack,
  proposeConfidentialMPTMergeInbox,
  proposeConfidentialMPTSend,
  type CmptConvertInput,
  type CmptMergeInboxInput,
  type CmptSendInput,
} from "../_actions/confidential-mpt";
import { useSubmitIntent } from "./useSubmitIntent";

export function useSubmitConfidentialMPTConvert() {
  return useSubmitIntent<CmptConvertInput>(proposeConfidentialMPTConvert);
}

export function useSubmitConfidentialMPTConvertBack() {
  return useSubmitIntent<CmptConvertInput>(proposeConfidentialMPTConvertBack);
}

export function useSubmitConfidentialMPTMergeInbox() {
  return useSubmitIntent<CmptMergeInboxInput>(proposeConfidentialMPTMergeInbox);
}

export function useSubmitConfidentialMPTSend() {
  return useSubmitIntent<CmptSendInput>(proposeConfidentialMPTSend);
}
