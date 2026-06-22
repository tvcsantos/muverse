export function insertSorted<T>(
  arr: T[],
  element: T,
  compareFn: (a: T, b: T) => number,
): T[] {
  let left = 0;
  let right = arr.length - 1;

  // Binary search to pinpoint the exact insertion index
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    const comparison = compareFn(arr[mid] as T, element);

    if (comparison === 0) {
      left = mid; // Exact match found, insert here
      break;
    } else if (comparison < 0) {
      left = mid + 1; // Search the right half
    } else {
      right = mid - 1; // Search the left half
    }
  }

  // 'left' is now the correct index to insert the element
  arr.splice(left, 0, element);
  return arr;
}
