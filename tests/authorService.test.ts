import app from "../server";
import Author from "../models/author"
import request from "supertest";

describe("Verify GET /authors", () => {
    const mockAuthors = [
        {name: "Tagore, Robi", lifespan: "1900 - 2000"},
        {name: "Asimov, Isaac", lifespan: "1920 - 1992"},
        {name: "Bova, Ben", lifespan: "1932 - "},
        {name: "Jones, Jim", lifespan: "1971 - "},
        {name: "Shelley, Mary", lifespan: "1797 - 1851"},
        {name: "Shakespeare, William", lifespan: "1564 - 1616"},
        {name: "Orwell, George", lifespan: "1903 - 1950"}
    ]

    let consoleSpy: jest.SpyInstance;

    beforeAll(() => {
        consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    });

    afterAll(() => {
        consoleSpy.mockRestore();
    });


    it("should respond with a list of author names and lifetimes sorted by the family name of the authors", async () => {
        // set up expected sorted response ahead of time
        const expectedSortedAuthors = [...mockAuthors].sort((a, b) => a.name.localeCompare((b.name)));

        // Mocks the responses of the real getAllAuthors function, this gets called by the response value below
        Author.getAllAuthors = jest.fn().mockImplementationOnce((sortOpts) => {
            if(sortOpts && sortOpts.family_name === 1) {
                return Promise.resolve(expectedSortedAuthors)
            }
            return Promise.resolve(mockAuthors);
        });

        // call the above mock implementation of getAllAuthors
        const response = await request(app).get("/authors")

        // assert the expect responses from GET /authors
        expect(response.statusCode).toBe(200);
        expect(expectedSortedAuthors).toStrictEqual(response.body);

    });


    it("should respond with 'No authors found' message if there are no authors in the database", async () => {
        Author.getAllAuthors = jest.fn().mockResolvedValue({})
        const response = await request(app).get("/authors");
        expect(response.statusCode).toBe(200);
        expect(response.text).toBe("No authors found")
    });

    it('should respond with a 500 if there is an error when retrieving the authors', async () => {
        Author.getAllAuthors = jest.fn().mockRejectedValue(new Error("Database error"));
        const response = await request(app).get("/authors");
        expect(response.statusCode).toBe(500);
        expect(response.text).toBe("No authors found")
    });

})
