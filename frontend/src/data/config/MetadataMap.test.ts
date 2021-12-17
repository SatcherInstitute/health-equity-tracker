import { dataSourceMetadataList } from "./MetadataMap";

describe("Test Data Source URLs", () => {
  test("Links all use HTTPS", () => {
    for (const source in dataSourceMetadataList) {
      const testUrl = dataSourceMetadataList[source].data_source_link;
      const requiredPrefix = "https://";
      expect(testUrl).toMatch(new RegExp(`^${requiredPrefix}?`));
    }
  });
});
