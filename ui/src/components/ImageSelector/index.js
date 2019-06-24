import React from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import axios from 'axios';
import urljoin from 'url-join';

import * as urls from 'urls';

import './ImageSelector.scss';


class ImageSelector extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      imageList: [],
      pageIndex: 10,
    };
  }

  componentDidMount() {
    axios
      .get(urljoin(urls.IMAGES_API_URL, this.props.person))
      .then(response => {
        this.setState({ imageList: response.data })
      });
  }

  loadMore = () => this.setState(prevState => ({ pageIndex: prevState.pageIndex + 10 }));

  render() {
    const { imageList, pageIndex } = this.state;
    const { person, onSelectImage } = this.props;

    const hasImages = imageList.length > 0;
    if (!hasImages || !person) {
      return <div className="loader">Loading ...</div>;
    }

    const items = imageList.slice(0, pageIndex).map((imageName, idx) => {
      const onClick = () => onSelectImage(imageName);

      return (
        <div className="figureContainer" key={imageName + idx}>
          <figure>
            <img
              onClick={onClick}
              src={urljoin(urls.IMAGE_API_URL, person, imageName)}
              alt={imageName}
              width={100}
              height={100}
            />
            <figcaption>{imageName}</figcaption>
          </figure>
        </div>
      )
    });


    return (
      <InfiniteScroll
        className="ImageSelector"
        loadMore={this.loadMore}
        hasMore={pageIndex < imageList.length}
        useWindow={false}
      >
        <div className="container">
          {items}
        </div>
      </InfiniteScroll>
    )
  }
};

export default ImageSelector
