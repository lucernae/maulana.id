import CMS from 'netlify-cms-app'
//commented until we have support from cms-widget
import { MdxControl, MdxPreview } from 'netlify-cms-widget-mdx';

CMS.registerWidget('mdx', MdxControl, MdxPreview);