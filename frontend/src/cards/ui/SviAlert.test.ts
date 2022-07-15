import { findRating, findColor } from "./SviAlert";
import styles from "./SviAlert.module.scss";

//Find Rating Unit Test
describe("find rating", () => {
  describe("when given a svi(number)", () => {
    it("should return a rating(string)", () => {
      const [svi, expected] = [0.23, "low"];
      const result = findRating(svi);
      expect(result).toEqual(expected);
    });
  });
  describe("when given a svi(number)", () => {
    it("should return a rating(string)", () => {
      const [svi, expected] = [0.45, "medium"];
      const result = findRating(svi);
      expect(result).toEqual(expected);
    });
  });
  describe("when given a svi(number)", () => {
    it("should return a rating(string)", () => {
      const [svi, expected] = [0.78, "high"];
      const result = findRating(svi);
      expect(result).toEqual(expected);
    });
  });
});

//Find Color Unit Test
describe("find color", () => {
  describe("when given a rating", () => {
    it("should return a className property", () => {
      const [rating, expected] = ["low", styles.Low];
      const result = findColor(rating);
      expect(result).toEqual(expected);
    });
  });
  describe("when given a rating", () => {
    it("should return a className property", () => {
      const [rating, expected] = ["medium", styles.Medium];
      const result = findColor(rating);
      expect(result).toEqual(expected);
    });
  });
  describe("when given a rating", () => {
    it("should return a className property", () => {
      const [rating, expected] = ["high", styles.High];
      const result = findColor(rating);
      expect(result).toEqual(expected);
    });
  });
});
