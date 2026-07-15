export class VirtualScroller<T> {
  getVisibleItems(
    items: T[],
    viewport: { x: number; y: number; width: number; height: number },
    itemHeight: number,
    buffer: number = 5
  ): T[] {
    if (items.length === 0) return [];

    const startIdx = Math.max(0, Math.floor((viewport.y / itemHeight) - buffer));
    const endIdx = Math.min(
      items.length,
      Math.ceil((viewport.y + viewport.height) / itemHeight) + buffer
    );

    return items.slice(startIdx, endIdx);
  }

  getVisibleRange(
    itemCount: number,
    viewportY: number,
    viewportHeight: number,
    itemHeight: number,
    buffer: number = 5
  ): { start: number; end: number; offsetTop: number; totalHeight: number } {
    if (itemCount === 0) return { start: 0, end: 0, offsetTop: 0, totalHeight: 0 };

    const totalHeight = itemCount * itemHeight;
    const start = Math.max(0, Math.floor(viewportY / itemHeight) - buffer);
    const end = Math.min(itemCount, Math.ceil((viewportY + viewportHeight) / itemHeight) + buffer);
    const offsetTop = start * itemHeight;

    return { start, end, offsetTop, totalHeight };
  }

  getVisibleGridItems(
    items: T[],
    viewport: { x: number; y: number; width: number; height: number },
    itemWidth: number,
    itemHeight: number,
    columns: number,
    buffer: number = 2
  ): T[] {
    if (items.length === 0) return [];

    const rowHeight = itemHeight;
    const startRow = Math.max(0, Math.floor(viewport.y / rowHeight) - buffer);
    const endRow = Math.min(
      Math.ceil(items.length / columns),
      Math.ceil((viewport.y + viewport.height) / rowHeight) + buffer
    );

    const startIdx = startRow * columns;
    const endIdx = Math.min(items.length, endRow * columns);

    return items.slice(startIdx, endIdx);
  }
}
