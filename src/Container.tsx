import React, { Component, CSSProperties, RefObject } from 'react'
import PropTypes from 'prop-types'
import { smoothDnD, ContainerOptions, SmoothDnD } from '@cisdi/smooth-dnd'
import { dropHandlers } from '@cisdi/smooth-dnd'

smoothDnD.dropHandler = dropHandlers.reactDropHandler().handler
smoothDnD.wrapChild = false

type RefCallback = (el: HTMLElement | string | null) => void

interface ContainerProps extends ContainerOptions {
  render?: (refCb: RefCallback) => React.ReactElement
  style?: CSSProperties
}

class Container extends Component<ContainerProps> {
  public static propTypes = {
    behavior: PropTypes.oneOf(['move', 'copy', 'drop-zone', 'contain']),
    groupName: PropTypes.string,
    orientation: PropTypes.oneOf(['horizontal', 'vertical']),
    style: PropTypes.object,
    dragHandleSelector: PropTypes.string,
    nonDragAreaSelector: PropTypes.string,
    dragBeginDelay: PropTypes.number,
    animationDuration: PropTypes.number,
    autoScrollEnabled: PropTypes.bool,
    lockAxis: PropTypes.string,
    dragClass: PropTypes.string,
    dropClass: PropTypes.string,
    onDragStart: PropTypes.func,
    onDragEnd: PropTypes.func,
    onDrop: PropTypes.func,
    getChildPayload: PropTypes.func,
    shouldAnimateDrop: PropTypes.func,
    shouldAcceptDrop: PropTypes.func,
    onDragEnter: PropTypes.func,
    onDragLeave: PropTypes.func,
    render: PropTypes.func,
    getGhostParent: PropTypes.func,
    removeOnDropOut: PropTypes.bool,
    dropPlaceholder: PropTypes.oneOfType([
      PropTypes.shape({
        className: PropTypes.string,
        animationDuration: PropTypes.number,
        showOnTop: PropTypes.bool,
      }),
      PropTypes.bool,
    ]),
  }

  public static defaultProps = {
    behavior: 'move',
    orientation: 'vertical',
  }

  prevContainer: null | HTMLElement
  el: HTMLElement | null
  container: SmoothDnD = null!
  containerRef: React.RefObject<any> = React.createRef()
  constructor(props: ContainerProps) {
    super(props)
    this.getContainerOptions = this.getContainerOptions.bind(this)
    this.initialDnD = this.initialDnD.bind(this)
    this.isObjectTypePropsChanged = this.isObjectTypePropsChanged.bind(this)
    this.prevContainer = null
    this.el = null
  }

  componentWillUnmount() {
    if (this.container) {
      this.container.dispose()
      this.container = null!
    }
  }

  componentDidUpdate(prevProps: ContainerProps) {
    if (this.isObjectTypePropsChanged(prevProps) && this.container) {
      this.container.setOptions(this.getContainerOptions())
    }
  }

  isObjectTypePropsChanged(prevProps: ContainerProps) {
    const { render, children, style, ...containerOptions } = this.props

    for (const _key in containerOptions) {
      const key = _key as keyof ContainerOptions
      if (containerOptions.hasOwnProperty(key)) {
        const prop = containerOptions[key]

        if (typeof prop !== 'function' && prop !== prevProps[key]) {
          return true
        }
      }
    }

    return false
  }

  initialDnD(el: HTMLElement | string | null) {
    if (this.container && el === this.el) {
      if (this.isObjectTypePropsChanged(prevProps) && this.container) {
        this.container.setOptions(this.getContainerOptions())
      }
    } else {
      if (this.container) {
        this.container.dispose()
      }
      if (el && typeof el !== 'string') {
        this.el = el
        this.container = smoothDnD(el, this.getContainerOptions())
      }
    }
  }

  getContainerOptions(): ContainerOptions {
    return Object.keys(this.props).reduce((result: any, key: string) => {
      const optionName = key as keyof ContainerOptions
      const prop = this.props[optionName]

      if (typeof prop === 'function') {
        result[optionName] = (...params: any[]) => {
          return (this.props[optionName] as Function)(...params)
        }
      } else {
        result[optionName] = prop
      }

      return result
    }, {}) as ContainerOptions
  }

  render() {
    if (this.props.render) {
      return this.props.render(this.initialDnD)
    } else {
      return (
        <div style={this.props.style} ref={this.initialDnD}>
          {this.props.children}
        </div>
      )
    }
  }
}

export default Container
