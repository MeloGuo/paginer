interface IPaginationConfig<T> {
  dataSource: T[] | string | Function; // 分页的数据源
  pageSize: number; // 每次分页有多少数据
  pageNumKey: string; // 接口请求页码的字段名
  [propName: string]: any;
}

enum EventType {
  Init = 'INIT',
  LoadMore = 'LOAD_MORE',
}

export default class Pagination<T> {
  private defaultConfig: IPaginationConfig<T> = {
    dataSource: [],
    pageNumKey: 'pageNum',
    pageSize: 5,
  };

  private pageNumManager: PageNumManager;

  public pageNum = 1;

  // WechatMiniprogram.Component.Instance<TData, TProperty, TMethod>
  public comp: any = null;

  constructor(comp: any, config?: IPaginationConfig<T>) {
    this.pageNumManager = new PageNumManager();
    this.pageNumManager.get();
    this.comp = comp;
    this.defaultConfig = Object.assign(this.defaultConfig, config);
  }

  // 初始化分页
  init() {
    const { dataSource } = this.defaultConfig;

    // 返回 Promise 的函数
    if (typeof dataSource === 'function') {
      dataSource({
        [this.defaultConfig.pageNumKey]: this.pageNum,
      })
        .then((res: any) =>
          this.comp.triggerEvent('updateList', {
            type: EventType.Init,
            data: res,
          }),
        )
        .catch((error: any) => {
          this.comp.triggerEvent('error', error);
        });
    }

    if (Array.isArray(dataSource)) {
      this.comp.triggerEvent('updateList', {
        type: 'init',
        data: this.updateData,
      });
    }
  }

  // 加载更多数据
  loadMore(params = {}) {
    const { dataSource } = this.defaultConfig;
    this.pageNum++;

    if (typeof dataSource === 'function') {
      dataSource({
        pageNum: this.pageNum,
        ...params
      })
        .then((res: any) => {
          this.comp.triggerEvent('updateList', {
            type: EventType.LoadMore,
            data: res,
          });
        })
        .catch((error: any) => {
          this.comp.triggerEvent('error', { error });
        });
    }

    if (Array.isArray(dataSource)) {
      this.comp.triggerEvent('updateList', {
        type: EventType.LoadMore,
        data: this.updateData,
      });
    }
  }

  private get updateData() {
    const { pageSize, dataSource } = this.defaultConfig;
    const index = this.pageNum - 1;
    const start = index * pageSize;
    const end = start + pageSize;
    return Array.isArray(dataSource) ? dataSource.slice(start, end) : null;
  }
}

class PageNumManager {
  private pageNum = 1;

  init() {
    return (this.pageNum = 1);
  }

  add() {
    return (this.pageNum += 1);
  }

  get() {
    return this.pageNum;
  }
}
