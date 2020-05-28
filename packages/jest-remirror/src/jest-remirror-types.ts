import {
  AnyExtension,
  AnyPreset,
  AttributesParameter,
  CombinedUnion,
  EditorSchema,
  ProsemirrorAttributes,
  ProsemirrorNode,
} from '@remirror/core';
import { RenderEditorProps } from '@remirror/react';

export interface BaseFactoryParameter<Schema extends EditorSchema = EditorSchema>
  extends Partial<AttributesParameter> {
  /**
   * The name of the node or mark
   */
  name: string;

  /**
   * The editor schema
   */
  schema: Schema;
}

/**
 * A useful feature of the builder is being able to declaratively mark positions
 * in content using the angled braces e.g. `<cursor>`.
 *
 * These positions are called tags, and are tracked on every node in the tree that has a tag on any of its descendants.
 */
export interface Tags {
  [name: string]: number;
}

/**
 * Content that contains tagged information.
 */
export type TaggedContentItem = TaggedProsemirrorNode | TagTracker;

/**
 * The data structures of the tagged content
 */
export type TaggedContent = TaggedContentItem | Array<ProsemirrorNode | TaggedContentItem>;

/**
 * Tagged content with text as well
 */
export type TaggedContentWithText = string | TaggedContent;

/**
 * ProseMirror doesn't support empty text nodes, making it difficult to
 * capture a tagged position without introducing text.
 *
 * E.g.:
 *
 *     p('<cursor>')
 *     p('Hello ', '<cursor>', 'world!')
 *
 * After the tagged syntax is stripped we're left with:
 *
 *     p('')
 *     p('Hello ', '', 'world!')
 *
 * This violates the rule of text nodes being non-empty. This class solves the
 * problem by providing an alternative data structure that *only* stores tags,
 * and can be used in scenarios where an empty text would be forbidden.
 *
 * This is done under the hood when using `text()` factory, and instead of
 * always returning a text node, it'll instead return one of two things:
 *
 * - a text node -- when given a non-empty string
 * - a tag tracker -- when given a string that *only* contains tags.
 */
export class TagTracker {
  public tags!: Tags;
}

/**
 * A standard ProseMirror Node that also tracks tags.
 */
export interface TaggedProsemirrorNode<Schema extends EditorSchema = EditorSchema>
  extends ProsemirrorNode<Schema> {
  tags: Tags;
}

export type MarkWithAttributes<Names extends string> = {
  [P in Names]: (
    attrs?: ProsemirrorAttributes,
  ) => (...content: TaggedContentWithText[]) => TaggedProsemirrorNode[];
};

export type NodeWithAttributes<Names extends string> = {
  [P in Names]: (
    attrs?: ProsemirrorAttributes,
  ) => (...content: TaggedContentWithText[]) => TaggedProsemirrorNode;
};

export type MarkWithoutAttributes<Names extends string> = {
  [P in Names]: (...content: TaggedContentWithText[]) => TaggedProsemirrorNode[];
};

export type NodeWithoutAttributes<Names extends string> = {
  [P in Names]: (...content: TaggedContentWithText[]) => TaggedProsemirrorNode;
};

export interface RenderEditorParameter<Combined extends CombinedUnion<AnyExtension, AnyPreset>> {
  settings?: Remirror.ManagerSettings;
  props?: Partial<Omit<RenderEditorProps<Combined>, 'manager'>>;
}
