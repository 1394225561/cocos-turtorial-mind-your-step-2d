import { _decorator, CCInteger, Component, Prefab, Node, instantiate } from 'cc'
const { ccclass, property } = _decorator
import { BLOCK_SIZE } from './PlayerController'

enum BlockType {
  BT_NONE,
  BT_STONE,
}

@ccclass('GameManager')
export class GameManager extends Component {
  @property({ type: Prefab })
  public boxPrefab: Prefab | null = null

  @property({ type: CCInteger })
  public roadLength: number = 50
  private _road: BlockType[] = []

  start() {
    this.generateRoad()
  }

  generateRoad() {
    // 每次生成前需要先置空
    this.node.removeAllChildren()

    this._road = []
    // startPos 第一块必须是石头
    this._road.push(BlockType.BT_STONE)

    for (let i = 1; i < this.roadLength; i++) {
      if (this._road[i - 1] === BlockType.BT_NONE) {
        // 不能有连续的空块 因为最多只能跳2步
        this._road.push(BlockType.BT_STONE)
      } else {
        this._road.push(Math.floor(Math.random() * 2))
      }
    }

    for (let j = 0; j < this._road.length; j++) {
      let block: Node | null = this.spawnBlockByType(this._road[j])
      if (block) {
        // 如果返回的是石头 则将石头添加到场景
        this.node.addChild(block)
        block.setPosition(j * BLOCK_SIZE, 0, 0)
      }
    }
  }

  spawnBlockByType(type: BlockType) {
    if (!this.boxPrefab) {
      return null
    }

    let block: Node | null = null
    switch (type) {
      case BlockType.BT_STONE:
        // 克隆一个石头预制体
        block = instantiate(this.boxPrefab)
        break
    }

    return block
  }
}
