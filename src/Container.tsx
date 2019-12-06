import React, { Component, CSSProperties } from 'react'
import PropTypes from 'prop-types'
import { smoothDnD, ContainerOptions, SmoothDnD } from '@cisdi/smooth-dnd'
import { dropHandlers } from '@cisdi/smooth-dnd'

smoothDnD.dropHandler = dropHandlers.reactDropHandler().handler
smoothDnD.wrapChild = false

interface ContainerProps extends ContainerOptions {
  render?: (rootRef: React.RefObject<any>) => React.ReactElement
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

  prevContainer: null
  container: SmoothDnD = null!
  containerRef: React.RefObject<any> = React.createRef()
  constructor(props: ContainerProps) {
    super(props)
    this.getContainerOptions = this.getContainerOptions.bind(this)
    this.getContainer = this.getContainer.bind(this)
    this.isObjectTypePropsChanged = this.isObjectTypePropsChanged.bind(this)
    this.prevContainer = null
  }

  componentDidMount() {
    const container = this.getContainer()
    if (container) {
      this.prevContainer = container
      this.container = smoothDnD(
        this.getContainer(),
        this.getContainerOptions()
      )
    }
  }

  componentWillUnmount() {
    if (this.container) {
      this.container.dispose()
      this.container = null!
    }
  }

  componentDidUpdate(prevProps: ContainerProps) {
    const container = this.getContainer()
    if (container) {
      if (this.prevContainer && this.prevContainer !== container) {
        if (this.container) {
          this.container.dispose()
        }
        this.container = smoothDnD(container, this.getContainerOptions())
        this.prevContainer = container
        return
      }

      if (this.isObjectTypePropsChanged(prevProps) && this.container) {
        this.container.setOptions(this.getContainerOptions())
      }
    } else {
      this.prevContainer = container
      if (this.container) {
        this.container.dispose()
      }
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

  render() {
    if (this.props.render) {
      return this.props.render(this.containerRef)
    } else {
      return (
        <div style={this.props.style} ref={this.containerRef}>
          {this.props.children}
        </div>
      )
    }
  }

  getContainer() {
    const container = this.containerRef.current
    return container
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
}

export default Container
