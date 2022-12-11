export type erfData = {
  resName: string;
  erfId: number;
  resData: any[];
  langId: string;
  resResRef: string;
  editableFields: any[];
  extraData: ExtraData;
};

export type ExtraData = {
  editableFields: string[];
};
