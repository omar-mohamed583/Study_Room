export default interface CustomContextType {
  theme: "dark" | "light",
  setTheme: (val: "dark" | "light") => void,
}