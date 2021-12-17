import { dataSourceMetadataList } from "./MetadataMap";

describe("Test Data Source URLs", () => {
  test("Links all use HTTPS", () => {
    for (const source in dataSourceMetadataList) {
      const testUrl = dataSourceMetadataList[source].data_source_link;
      expect(testUrl.slice(0, 8)).toEqual("https://");
    }
  });
});
