import { getDataManager } from "../../utils/globals";
import { useEffect } from "react";
import { MetadataMap } from "../utils/DatasetTypes";

async function onMetadataLoaded(callback: (metadata: MetadataMap) => void) {
  try {
    const metadata = await getDataManager().loadMetadata();
    callback(metadata);
    // Swallow errors - they are logged in the DataManager
  } catch (e) {}
}

/**
 * @param callback Callback that is executed exactly once, once metadata is
 *     loaded.
 */
export default function useOnMetadataLoaded(
  callback: (metadata: MetadataMap) => void
) {
  useEffect(() => {
    onMetadataLoaded(callback);
    // eslint-disable-next-line
  }, []);
}
