import useCollection from "./useCollection";

describe("Gets test documents", () => {
  const [data, loading, error] = useCollection("test");
  beforeEach(() => {});
  afterEach(() => {});
  it("Data contains documents", () => {
    expect(data[0].value.toEqual("Hello"));
    expect(data[1].value.toEndWith("Hello2"));
  });
});
