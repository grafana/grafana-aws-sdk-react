// Due to the grafana/ui Icon component making fetch requests to
// `/public/img/icon/<icon_name>.svg`, mock react-inlinesvg to keep tests quiet.
import React from 'react';

type Callback = (...args: unknown[]) => void;

export interface StorageItem {
  content: string;
  queue: Callback[];
  status: string;
}

export const cacheStore: { [key: string]: StorageItem } = Object.create(null);

const SVG_FILE_NAME_REGEX = /(.+)\/(.+)\.svg$/;

const InlineSVG = ({ src }: { src: string }) => {
  // testId is file name without extension (e.g. `.../angle-double-down.svg` -> `angle-double-down`)
  const testId = src.replace(SVG_FILE_NAME_REGEX, '$2');
  return <svg xmlns="http://www.w3.org/2000/svg" data-testid={testId} viewBox="0 0 24 24" />;
};

export default InlineSVG;
