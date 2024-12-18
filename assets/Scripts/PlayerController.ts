import {
  _decorator,
  Component,
  EventMouse,
  Node,
  input,
  Input,
  Vec3,
  Animation,
} from 'cc'
const { ccclass, property } = _decorator

export const BLOCK_SIZE = 40 // 添加一个放大比

@ccclass('PlayerController')
export class PlayerController extends Component {
  @property(Animation)
  BodyAnim: Animation = null

  private _startJump: boolean = false // 用于判断角色是否在跳跃状态
  private _jumpStep: number = 0 // 用于记录鼠标的输入，并将其转化为数值。规定角色最多只能跳两步，那么它可能是 1 或者 2。
  private _curJumpTime: number = 0 // 计算单次跳跃所花时间 和_jumpTime比较，来判断跳跃是否结束
  private _jumpTime: number = 0.1 // 用于记录整个跳跃的时长 0.1s完成一次跳跃
  private _curJumpSpeed: number = 0 // 记录跳跃时的移动速度
  private _curPos: Vec3 = new Vec3() // 记录和计算角色的当前位置
  private _deltaPos: Vec3 = new Vec3(0, 0, 0) // 每一帧都需要记录下位置和时间间隔的乘积，用来存储计算结果
  private _targetPos: Vec3 = new Vec3() // 最终的落点，在跳跃结束时将角色移动这个位置以确保最终的位置正确，这样可以处理掉某些误差的情况

  start() {
    input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this)
  }

  reset() {}

  update(deltaTime: number) {
    this.onUpdateMove(deltaTime)
  }

  onUpdateMove(deltaTime: number) {
    if (this._startJump) {
      this._curJumpTime += deltaTime // 累计总的跳跃时间
      if (this._curJumpTime > this._jumpTime) {
        // 当跳跃时间是否结束
        // end
        this.node.setPosition(this._targetPos) // 强制位置到终点
        this._startJump = false // 清理跳跃标记
      } else {
        // tween
        this.node.getPosition(this._curPos)
        this._deltaPos.x = this._curJumpSpeed * deltaTime // 每一帧根据速度和时间计算位移
        Vec3.add(this._curPos, this._curPos, this._deltaPos) // 应用这个位移
        this.node.setPosition(this._curPos) // 将位移设置给角色
      }
    }
  }

  onMouseUp(event: EventMouse) {
    if (event.getButton() === 0) {
      this.jumpByStep(1)
    } else if (event.getButton() === 2) {
      this.jumpByStep(2)
    }
  }

  // 每次跳跃 需要达到的目标位置最终效果
  jumpByStep(step: number) {
    if (this._startJump) {
      return
    }
    const clipName = step === 1 ? 'oneStep' : 'twoStep'
    const state = this.BodyAnim.getState(clipName)
    this._jumpTime = state.duration // 通过获取动画剪辑的时长来动态调整 _jumpTime
    if (this.BodyAnim) {
      this.BodyAnim.play(clipName)
    }

    this._startJump = true // 标记开始跳跃
    this._jumpStep = step // 跳跃的步数 1 或者 2
    this._curJumpTime = 0 // 重置开始跳跃的时间
    this._curJumpSpeed = (this._jumpStep * BLOCK_SIZE) / this._jumpTime // 根据时间计算出速度
    this.node.getPosition(this._curPos) // 获取角色当前的位置
    Vec3.add(
      this._targetPos,
      this._curPos,
      new Vec3(this._jumpStep * BLOCK_SIZE, 0, 0)
    ) // 计算出目标位置
  }
}
