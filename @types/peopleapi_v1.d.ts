declare namespace GoogleAppsScript.People.Schema {
  interface Person {
    externalIds?: People.Schema.ExternalId[] | undefined;
  }

  interface Organization {
    costCenter?: string | undefined;
  }
}