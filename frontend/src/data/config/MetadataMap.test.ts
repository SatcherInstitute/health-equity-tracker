import { dataSourceMetadataList } from "./MetadataMap";
import { datasetMetadataList } from "./DatasetMetadata";
import { DatasetMetadata } from "../utils/DatasetTypes";

describe("Test Data Source URLs", () => {
  test("Links all use HTTPS", () => {
    for (const source in dataSourceMetadataList) {
      const testUrl = dataSourceMetadataList[source].data_source_link;
      expect(testUrl.slice(0, 8)).toEqual("https://");
    }
  });
});

describe("Test Data Source IDs", () => {
  test("All ids in MetadataMap are present in DatasetMeta", () => {
    const setIds = datasetMetadataList.map((set: DatasetMetadata) => set.id);

    const sourceIds: string[] = ["geographies"];
    for (const item of dataSourceMetadataList) {
      sourceIds.push(...item.dataset_ids);
    }

    expect(new Set(sourceIds)).toEqual(new Set(setIds));
  });
});
