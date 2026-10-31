import type { Scope } from "bunja";
import { createStore } from "jotai";
import type { Context } from "react";
import type { CreateFormConfig, FormSchema } from "unsaturated/form";
import {
  type JotaiStore,
  JotaiStoreContext,
  JotaiStoreScope,
} from "unsaturated/store";

// Check the emitted package declarations, including Jotai's private exports.
const store: JotaiStore = createStore();
const context: Context<JotaiStore> = JotaiStoreContext;
const scope: Scope<JotaiStore> = JotaiStoreScope;
declare const config: CreateFormConfig<FormSchema>;
const formStore: JotaiStore = config.store;
void [store, context, scope, formStore];
