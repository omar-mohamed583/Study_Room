export default function debounce(callBack: any, delay: number = 1000) {
  let timeout: any;

  return (...params: any) => {
    clearTimeout(timeout);

    timeout = setTimeout(() => callBack(...params), delay);
  };
}
