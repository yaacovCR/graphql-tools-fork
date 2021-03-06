import {
  GraphQLSchema,
  GraphQLField,
  ExecutionResult,
  GraphQLInputType,
  GraphQLType,
  GraphQLNamedType,
  GraphQLFieldResolver,
  GraphQLResolveInfo,
  GraphQLIsTypeOfFn,
  GraphQLTypeResolver,
  GraphQLScalarType,
  DocumentNode,
  FieldNode,
  GraphQLEnumValue,
  GraphQLEnumType,
  GraphQLUnionType,
  GraphQLArgument,
  GraphQLInputField,
  GraphQLInputObjectType,
  GraphQLInterfaceType,
  GraphQLObjectType,
  InlineFragmentNode,
  GraphQLOutputType,
  SelectionSetNode,
  GraphQLDirective,
  GraphQLFieldConfig,
  FragmentDefinitionNode,
  SelectionNode,
  VariableDefinitionNode,
  ASTNode,
} from 'graphql';

import { TypeMap } from 'graphql/type/schema';
import { ApolloLink } from 'apollo-link';

import { SchemaVisitor } from './utils/SchemaVisitor';
import { SchemaDirectiveVisitor } from './utils/SchemaDirectiveVisitor';

/**
 * @category Schema Generation
 */
export interface IResolverValidationOptions {
  requireResolversForArgs?: boolean;
  requireResolversForNonScalar?: boolean;
  requireResolversForAllFields?: boolean;
  requireResolversForResolveType?: boolean;
  allowResolversNotInSchema?: boolean;
}

// for backwards compatibility
/**
 * @category Schema Generation
 */
export interface IAddResolveFunctionsToSchemaOptions {
  schema: GraphQLSchema;
  resolvers: IResolvers;
  defaultFieldResolver: IFieldResolver<any, any>;
  resolverValidationOptions: IResolverValidationOptions;
  inheritResolversFromInterfaces: boolean;
}

/**
 * @category Schema Generation
 */
export interface IAddResolversToSchemaOptions {
  schema: GraphQLSchema;
  resolvers: IResolvers;
  defaultFieldResolver?: IFieldResolver<any, any>;
  resolverValidationOptions?: IResolverValidationOptions;
  inheritResolversFromInterfaces?: boolean;
}

/**
 * @category Schema Generation
 */
export interface IResolverOptions<TSource = any, TContext = any, TArgs = any> {
  fragment?: string;
  resolve?: IFieldResolver<TSource, TContext, TArgs>;
  subscribe?: IFieldResolver<TSource, TContext, TArgs>;
  __resolveType?: GraphQLTypeResolver<TSource, TContext>;
  __isTypeOf?: GraphQLIsTypeOfFn<TSource, TContext>;
}

/**
 * @category Schema Wrapping
 */
export interface Transform {
  transformSchema?: (schema: GraphQLSchema) => GraphQLSchema;
  transformRequest?: (originalRequest: Request) => Request;
  transformResult?: (result: Result) => Result;
}

/**
 * @category Schema Wrapping
 */
export type FieldTransformer = (
  typeName: string,
  fieldName: string,
  field: GraphQLField<any, any>,
) => GraphQLFieldConfig<any, any> | RenamedField | null | undefined;

/**
 * @category Schema Wrapping
 */
export type FieldNodeTransformer = (
  typeName: string,
  fieldName: string,
  fieldNode: FieldNode,
  fragments: Record<string, FragmentDefinitionNode>,
) => SelectionNode | Array<SelectionNode>;

/**
 * @category Schema Wrapping
 */
export type RenamedField = {
  name: string;
  field?: GraphQLFieldConfig<any, any>;
};

export type FieldFilter = (
  typeName?: string,
  fieldName?: string,
  field?: GraphQLField<any, any>,
) => boolean;

export type RootFieldFilter = (
  operation?: 'Query' | 'Mutation' | 'Subscription',
  rootFieldName?: string,
  field?: GraphQLField<any, any>,
) => boolean;

/**
 * @category Schema Stitching
 */
export interface IGraphQLToolsResolveInfo extends GraphQLResolveInfo {
  mergeInfo?: MergeInfo;
}

/**
 * @category Schema Delegation
 */
export type Fetcher = (
  operation: IFetcherOperation,
) => Promise<ExecutionResult>;

/**
 * @category Schema Delegation
 */
export interface IFetcherOperation {
  query: DocumentNode;
  operationName?: string;
  variables?: { [key: string]: any };
  context?: { [key: string]: any };
}

/**
 * @category Schema Delegation
 */
export type Dispatcher = (context: any) => ApolloLink | Fetcher;

/**
 * @category Schema Delegation
 */
export interface SubschemaConfig {
  schema: GraphQLSchema;
  rootValue?: Record<string, any>;
  executor?: Delegator;
  subscriber?: Delegator;
  link?: ApolloLink;
  fetcher?: Fetcher;
  dispatcher?: Dispatcher;
  transforms?: Array<Transform>;
  merge?: Record<string, MergedTypeConfig>;
}

/**
 * @category Schema Stitching
 */
export interface MergedTypeConfig {
  selectionSet?: string;
  fieldName?: string;
  args?: (originalResult: any) => Record<string, any>;
  resolve?: MergedTypeResolver;
}

/**
 * @category Schema Stitching
 */
export type MergedTypeResolver = (
  originalResult: any,
  context: Record<string, any>,
  info: IGraphQLToolsResolveInfo,
  subschema: GraphQLSchema | SubschemaConfig,
  selectionSet: SelectionSetNode,
) => any;

/**
 * @category Schema Wrapping
 */
export interface GraphQLSchemaWithTransforms extends GraphQLSchema {
  transforms?: Array<Transform>;
}

/**
 * @category Schema Stitching
 */
export type SchemaLikeObject =
  | SubschemaConfig
  | GraphQLSchema
  | string
  | DocumentNode
  | Array<GraphQLNamedType>;

/**
 * @category Schema Stitching
 */
export function isSubschemaConfig(
  value: SchemaLikeObject,
): value is SubschemaConfig {
  return Boolean((value as SubschemaConfig).schema);
}

/**
 * @category Schema Delegation
 */
export interface IDelegateToSchemaOptions<TContext = { [key: string]: any }> {
  schema: GraphQLSchema | SubschemaConfig;
  operation?: Operation;
  fieldName?: string;
  returnType?: GraphQLOutputType;
  args?: { [key: string]: any };
  selectionSet?: SelectionSetNode;
  fieldNodes?: ReadonlyArray<FieldNode>;
  context?: TContext;
  info: IGraphQLToolsResolveInfo;
  rootValue?: Record<string, any>;
  transforms?: Array<Transform>;
  skipValidation?: boolean;
  skipTypeMerging?: boolean;
}

/**
 * @category Schema Delegation
 */
export interface ICreateRequestFromInfo {
  info: IGraphQLToolsResolveInfo;
  operation: Operation;
  fieldName: string;
  selectionSet?: SelectionSetNode;
  fieldNodes?: ReadonlyArray<FieldNode>;
}

/**
 * @category Schema Delegation
 */
export interface ICreateRequest {
  sourceSchema: GraphQLSchema;
  sourceParentType: GraphQLObjectType;
  sourceFieldName: string;
  fragments: Record<string, FragmentDefinitionNode>;
  variableDefinitions: ReadonlyArray<VariableDefinitionNode>;
  variableValues: Record<string, any>;
  targetOperation: Operation;
  targetFieldName: string;
  selectionSet: SelectionSetNode;
  fieldNodes: ReadonlyArray<FieldNode>;
}

/**
 * @category Schema Delegation
 */
export interface IDelegateRequestOptions extends IDelegateToSchemaOptions {
  request: Request;
}

/**
 * @category Schema Delegation
 */
export type Delegator = ({
  document,
  context,
  variables,
}: {
  document: DocumentNode;
  context?: { [key: string]: any };
  variables?: { [key: string]: any };
}) => any;

/**
 * @category Schema Stitching
 */
export interface MergeInfo {
  delegate: (
    type: 'query' | 'mutation' | 'subscription',
    fieldName: string,
    args: { [key: string]: any },
    context: { [key: string]: any },
    info: GraphQLResolveInfo,
    transforms?: Array<Transform>,
  ) => any;
  fragments: Array<{
    field: string;
    fragment: string;
  }>;
  replacementSelectionSets: ReplacementSelectionSetMapping;
  replacementFragments: ReplacementFragmentMapping;
  mergedTypes: Record<string, MergedTypeInfo>;
  delegateToSchema<TContext>(options: IDelegateToSchemaOptions<TContext>): any;
}

/**
 * @category Schema Stitching
 */
export interface ReplacementSelectionSetMapping {
  [typeName: string]: { [fieldName: string]: SelectionSetNode };
}

/**
 * @category Schema Stitching
 */
export interface ReplacementFragmentMapping {
  [typeName: string]: { [fieldName: string]: InlineFragmentNode };
}

/**
 * @category Schema Stitching
 */
export interface MergedTypeInfo {
  subschemas: Array<SubschemaConfig>;
  selectionSet?: SelectionSetNode;
  uniqueFields: Record<string, SubschemaConfig>;
  nonUniqueFields: Record<string, Array<SubschemaConfig>>;
  typeMaps: Map<SubschemaConfig, TypeMap>;
  selectionSets: Map<SubschemaConfig, SelectionSetNode>;
  containsSelectionSet: Map<SubschemaConfig, Map<SelectionSetNode, boolean>>;
}

/**
 * @category Schema Generation
 */
export type IFieldResolver<TSource, TContext, TArgs = Record<string, any>> = (
  source: TSource,
  args: TArgs,
  context: TContext,
  info: IGraphQLToolsResolveInfo,
) => any;

/**
 * @category Schema Generation
 */
export type ITypedef = (() => Array<ITypedef>) | string | DocumentNode;

/**
 * @category Schema Generation
 */
export type ITypeDefinitions = ITypedef | Array<ITypedef>;

/**
 * @category Schema Generation
 */
export interface IResolverObject<TSource = any, TContext = any, TArgs = any> {
  [key: string]:
    | IFieldResolver<TSource, TContext, TArgs>
    | IResolverOptions<TSource, TContext>
    | IResolverObject<TSource, TContext>;
}

/**
 * @category Schema Generation
 */
export interface IEnumResolver {
  [key: string]: string | number;
}

/**
 * @category Schema Generation
 */
export interface IResolvers<TSource = any, TContext = any> {
  [key: string]:
    | (() => any)
    | IResolverObject<TSource, TContext>
    | IResolverOptions<TSource, TContext>
    | GraphQLScalarType
    | IEnumResolver;
}

/**
 * @category Schema Generation
 */
export type IResolversParameter =
  | Array<IResolvers | ((mergeInfo: MergeInfo) => IResolvers)>
  | IResolvers
  | ((mergeInfo: MergeInfo) => IResolvers);

/**
 * @category Schema Generation
 */
export interface ILogger {
  log: (error: Error) => void;
}

/**
 * @category Schema Generation
 */
export type IConnectorCls<TContext = any> = new (context?: TContext) => any;

/**
 * @category Schema Generation
 */
export type IConnectorFn<TContext = any> = (context?: TContext) => any;

/**
 * @category Schema Generation
 */
export type IConnector<TContext = any> =
  | IConnectorCls<TContext>
  | IConnectorFn<TContext>;

/**
 * @category Schema Generation
 */
export interface IConnectors<TContext = any> {
  [key: string]: IConnector<TContext>;
}

/**
 * @category Schema Generation
 */
export interface IExecutableSchemaDefinition<TContext = any> {
  typeDefs: ITypeDefinitions;
  resolvers?: IResolvers<any, TContext> | Array<IResolvers<any, TContext>>;
  connectors?: IConnectors<TContext>;
  logger?: ILogger;
  allowUndefinedInResolve?: boolean;
  resolverValidationOptions?: IResolverValidationOptions;
  directiveResolvers?: IDirectiveResolvers<any, TContext>;
  schemaDirectives?: { [name: string]: typeof SchemaDirectiveVisitor };
  parseOptions?: GraphQLParseOptions;
  inheritResolversFromInterfaces?: boolean;
}

/**
 * @category Schema Utility
 */
export type IFieldIteratorFn = (
  fieldDef: GraphQLField<any, any>,
  typeName: string,
  fieldName: string,
) => void;

/**
 * @category Schema Utility
 */
export type IDefaultValueIteratorFn = (
  type: GraphQLInputType,
  value: any,
) => void;

/**
 * @category Schema Generation
 */
export type NextResolverFn = () => Promise<any>;

/**
 * @category Schema Generation
 */
export type DirectiveResolverFn<TSource = any, TContext = any> = (
  next: NextResolverFn,
  source: TSource,
  args: { [argName: string]: any },
  context: TContext,
  info: GraphQLResolveInfo,
) => any;

/**
 * @category Schema Generation
 */
export interface IDirectiveResolvers<TSource = any, TContext = any> {
  [directiveName: string]: DirectiveResolverFn<TSource, TContext>;
}

/* XXX on mocks, args are optional, Not sure if a bug. */
/**
 * @category Schema Mocking
 */
export type IMockFn = GraphQLFieldResolver<any, any>;

/**
 * @category Schema Mocking
 */
export interface IMocks {
  [key: string]: IMockFn;
}

/**
 * @category Schema Mocking
 */
export type IMockTypeFn = (
  type: GraphQLType,
  typeName?: string,
  fieldName?: string,
) => GraphQLFieldResolver<any, any>;

/**
 * @category Schema Mocking
 */
export interface IMockOptions {
  schema?: GraphQLSchema;
  mocks?: IMocks;
  preserveResolvers?: boolean;
}

/**
 * @category Schema Mocking
 */
export interface IMockServer {
  query: (
    query: string,
    vars?: { [key: string]: any },
  ) => Promise<ExecutionResult>;
}

/**
 * @category Schema Stitching
 */
export type OnTypeConflict = (
  left: GraphQLNamedType,
  right: GraphQLNamedType,
  info?: {
    left: {
      schema?: GraphQLSchema | SubschemaConfig;
    };
    right: {
      schema?: GraphQLSchema | SubschemaConfig;
    };
  },
) => GraphQLNamedType;

/**
 * @category Schema Stitching
 */
export type Operation = 'query' | 'mutation' | 'subscription';

/**
 * @category Schema Stitching
 */
export interface Request {
  document: DocumentNode;
  variables: Record<string, any>;
  extensions?: Record<string, any>;
}

/**
 * @category Schema Stitching
 */
export interface Result extends ExecutionResult {
  extensions?: Record<string, any>;
}

/**
 * @category Schema Generation
 */
export interface GraphQLParseOptions {
  noLocation?: boolean;
  allowLegacySDLEmptyFields?: boolean;
  allowLegacySDLImplementsInterfaces?: boolean;
  experimentalFragmentVariables?: boolean;
}

export type IndexedObject<V> = { [key: string]: V } | ReadonlyArray<V>;

/**
 * @category Schema Utility
 */
export type VisitableSchemaType =
  | GraphQLSchema
  | GraphQLObjectType
  | GraphQLInterfaceType
  | GraphQLInputObjectType
  | GraphQLNamedType
  | GraphQLScalarType
  | GraphQLField<any, any>
  | GraphQLInputField
  | GraphQLArgument
  | GraphQLUnionType
  | GraphQLEnumType
  | GraphQLEnumValue;

/**
 * @category Schema Utility
 */
export type VisitorSelector = (
  type: VisitableSchemaType,
  methodName: string,
) => Array<SchemaVisitor | SchemaVisitorMap>;

/**
 * @category Schema Utility
 */
export enum VisitSchemaKind {
  TYPE = 'VisitSchemaKind.TYPE',
  SCALAR_TYPE = 'VisitSchemaKind.SCALAR_TYPE',
  ENUM_TYPE = 'VisitSchemaKind.ENUM_TYPE',
  COMPOSITE_TYPE = 'VisitSchemaKind.COMPOSITE_TYPE',
  OBJECT_TYPE = 'VisitSchemaKind.OBJECT_TYPE',
  INPUT_OBJECT_TYPE = 'VisitSchemaKind.INPUT_OBJECT_TYPE',
  ABSTRACT_TYPE = 'VisitSchemaKind.ABSTRACT_TYPE',
  UNION_TYPE = 'VisitSchemaKind.UNION_TYPE',
  INTERFACE_TYPE = 'VisitSchemaKind.INTERFACE_TYPE',
  ROOT_OBJECT = 'VisitSchemaKind.ROOT_OBJECT',
  QUERY = 'VisitSchemaKind.QUERY',
  MUTATION = 'VisitSchemaKind.MUTATION',
  SUBSCRIPTION = 'VisitSchemaKind.SUBSCRIPTION',
}

/**
 * @category Schema Utility
 */
export interface SchemaVisitorMap {
  [VisitSchemaKind.TYPE]?: NamedTypeVisitor;
  [VisitSchemaKind.SCALAR_TYPE]?: ScalarTypeVisitor;
  [VisitSchemaKind.ENUM_TYPE]?: EnumTypeVisitor;
  [VisitSchemaKind.COMPOSITE_TYPE]?: CompositeTypeVisitor;
  [VisitSchemaKind.OBJECT_TYPE]?: ObjectTypeVisitor;
  [VisitSchemaKind.INPUT_OBJECT_TYPE]?: InputObjectTypeVisitor;
  [VisitSchemaKind.ABSTRACT_TYPE]?: AbstractTypeVisitor;
  [VisitSchemaKind.UNION_TYPE]?: UnionTypeVisitor;
  [VisitSchemaKind.INTERFACE_TYPE]?: InterfaceTypeVisitor;
  [VisitSchemaKind.ROOT_OBJECT]?: ObjectTypeVisitor;
  [VisitSchemaKind.QUERY]?: ObjectTypeVisitor;
  [VisitSchemaKind.MUTATION]?: ObjectTypeVisitor;
  [VisitSchemaKind.SUBSCRIPTION]?: ObjectTypeVisitor;
}

/**
 * @category Schema Utility
 */
export type NamedTypeVisitor = (
  type: GraphQLNamedType,
  schema: GraphQLSchema,
) => GraphQLNamedType | null | undefined;

/**
 * @category Schema Utility
 */
export type ScalarTypeVisitor = (
  type: GraphQLScalarType,
  schema: GraphQLSchema,
) => GraphQLScalarType | null | undefined;

/**
 * @category Schema Utility
 */
export type EnumTypeVisitor = (
  type: GraphQLEnumType,
  schema: GraphQLSchema,
) => GraphQLEnumType | null | undefined;

/**
 * @category Schema Utility
 */
export type CompositeTypeVisitor = (
  type: GraphQLObjectType | GraphQLInterfaceType | GraphQLUnionType,
  schema: GraphQLSchema,
) =>
  | GraphQLObjectType
  | GraphQLInterfaceType
  | GraphQLUnionType
  | null
  | undefined;

/**
 * @category Schema Utility
 */
export type ObjectTypeVisitor = (
  type: GraphQLObjectType,
  schema: GraphQLSchema,
) => GraphQLObjectType | null | undefined;

/**
 * @category Schema Utility
 */
export type InputObjectTypeVisitor = (
  type: GraphQLInputObjectType,
  schema: GraphQLSchema,
) => GraphQLInputObjectType | null | undefined;

/**
 * @category Schema Utility
 */
export type AbstractTypeVisitor = (
  type: GraphQLInterfaceType | GraphQLUnionType,
  schema: GraphQLSchema,
) => GraphQLInterfaceType | GraphQLUnionType | null | undefined;

/**
 * @category Schema Utility
 */
export type UnionTypeVisitor = (
  type: GraphQLUnionType,
  schema: GraphQLSchema,
) => GraphQLUnionType | null | undefined;

/**
 * @category Schema Utility
 */
export type InterfaceTypeVisitor = (
  type: GraphQLInterfaceType,
  schema: GraphQLSchema,
) => GraphQLInterfaceType | null | undefined;

/**
 * @category Schema Utility
 */
export enum MapperKind {
  TYPE = 'MapperKind.TYPE',
  SCALAR_TYPE = 'MapperKind.SCALAR_TYPE',
  ENUM_TYPE = 'MapperKind.ENUM_TYPE',
  COMPOSITE_TYPE = 'MapperKind.COMPOSITE_TYPE',
  OBJECT_TYPE = 'MapperKind.OBJECT_TYPE',
  INPUT_OBJECT_TYPE = 'MapperKind.INPUT_OBJECT_TYPE',
  ABSTRACT_TYPE = 'MapperKind.ABSTRACT_TYPE',
  UNION_TYPE = 'MapperKind.UNION_TYPE',
  INTERFACE_TYPE = 'MapperKind.INTERFACE_TYPE',
  ROOT_OBJECT = 'MapperKind.ROOT_OBJECT',
  QUERY = 'MapperKind.QUERY',
  MUTATION = 'MapperKind.MUTATION',
  SUBSCRIPTION = 'MapperKind.SUBSCRIPTION',
  DIRECTIVE = 'MapperKind.DIRECTIVE',
}

/**
 * @category Schema Utility
 */
export interface SchemaMapper {
  [MapperKind.TYPE]?: NamedTypeMapper;
  [MapperKind.SCALAR_TYPE]?: ScalarTypeMapper;
  [MapperKind.ENUM_TYPE]?: EnumTypeMapper;
  [MapperKind.COMPOSITE_TYPE]?: CompositeTypeMapper;
  [MapperKind.OBJECT_TYPE]?: ObjectTypeMapper;
  [MapperKind.INPUT_OBJECT_TYPE]?: InputObjectTypeMapper;
  [MapperKind.ABSTRACT_TYPE]?: AbstractTypeMapper;
  [MapperKind.UNION_TYPE]?: UnionTypeMapper;
  [MapperKind.INTERFACE_TYPE]?: InterfaceTypeMapper;
  [MapperKind.ROOT_OBJECT]?: ObjectTypeMapper;
  [MapperKind.QUERY]?: ObjectTypeMapper;
  [MapperKind.MUTATION]?: ObjectTypeMapper;
  [MapperKind.SUBSCRIPTION]?: ObjectTypeMapper;
  [MapperKind.DIRECTIVE]?: DirectiveMapper;
}

/**
 * @category Schema Utility
 */
export type NamedTypeMapper = (
  type: GraphQLNamedType,
  schema: GraphQLSchema,
) => GraphQLNamedType | null | undefined;

/**
 * @category Schema Utility
 */
export type ScalarTypeMapper = (
  type: GraphQLScalarType,
  schema: GraphQLSchema,
) => GraphQLScalarType | null | undefined;

/**
 * @category Schema Utility
 */
export type EnumTypeMapper = (
  type: GraphQLEnumType,
  schema: GraphQLSchema,
) => GraphQLEnumType | null | undefined;

/**
 * @category Schema Utility
 */
export type CompositeTypeMapper = (
  type: GraphQLObjectType | GraphQLInterfaceType | GraphQLUnionType,
  schema: GraphQLSchema,
) =>
  | GraphQLObjectType
  | GraphQLInterfaceType
  | GraphQLUnionType
  | null
  | undefined;

/**
 * @category Schema Utility
 */
export type ObjectTypeMapper = (
  type: GraphQLObjectType,
  schema: GraphQLSchema,
) => GraphQLObjectType | null | undefined;

/**
 * @category Schema Utility
 */
export type InputObjectTypeMapper = (
  type: GraphQLInputObjectType,
  schema: GraphQLSchema,
) => GraphQLInputObjectType | null | undefined;

/**
 * @category Schema Utility
 */
export type AbstractTypeMapper = (
  type: GraphQLInterfaceType | GraphQLUnionType,
  schema: GraphQLSchema,
) => GraphQLInterfaceType | GraphQLUnionType | null | undefined;

/**
 * @category Schema Utility
 */
export type UnionTypeMapper = (
  type: GraphQLUnionType,
  schema: GraphQLSchema,
) => GraphQLUnionType | null | undefined;

/**
 * @category Schema Utility
 */
export type InterfaceTypeMapper = (
  type: GraphQLInterfaceType,
  schema: GraphQLSchema,
) => GraphQLInterfaceType | null | undefined;

/**
 * @category Schema Utility
 */
export type DirectiveMapper = (
  directive: GraphQLDirective,
  schema: GraphQLSchema,
) => GraphQLDirective | null | undefined;

/**
 * @category Schema Generation
 */
export function isASTNode(
  astNode: any,
): astNode is ASTNode {
  return (astNode as ASTNode).kind !== undefined;
}
