import React, { useEffect, useRef, useState } from "react";
import { ScrollView, View } from "react-native";
import { IFormHook, TFormHook } from "../../@types/common";
import { styles } from "../../assets/styles/styles";
import { useForm } from "../../hooks/common/useForm";
import { useSet } from "../../hooks/common/useSet";
import { useDraftListener } from "../../hooks/drafts/useDraftListener";
import { formHooks } from "../../hooks/handlers/useFormHandler";
import { createForm, getValidators, RenderForm } from "../../utils/formUtils";
import FormButton from "../reusable/FormButton";

const FormHandler = ({ navigation, route }: any) => {
  const { params } = route || {};
  const { id: paramId, draftId: _draftId, source, state, data, title } = params;

  const [draftId, setDraftId] = useState(_draftId);

  const formHook = formHooks?.[source];

  const { form, onChange, validateForm, updateFormValues, clearForm, setForm } =
    useForm(data);

  const {
    error,
    setError,
    submitting,
    uploadData,
    data: responseData,
  } = useSet();

  const hookOptions: TFormHook = {
    id: paramId,
    navigation,
    form,
    updateFormValues,
    clearForm,
    state,
    responseData,
    params,
    error,
  };

  const {
    id: hookId,
    fields = [],
    defaultValues,
    onSubmit,
    submitText,
    sections = [],
    steps = [],
    defaultStep,
    ignoreValidation,
    showSubmit = true,
    allowDraftSave = true,
    draftMinSize,
    draftKey,
  }: IFormHook = formHook ? formHook(hookOptions) : {};

  const id = paramId || hookId;

  const _draftKey = draftKey || source;

  const handleValidation = () => {
    if (
      validateForm(
        sections.length > 0 ? getValidators(sections) : fields,
        setError
      )
    ) {
      handleSubmit();
    }
  };

  const allowSave = useRef(allowDraftSave);

  const handleSubmit = () => {
    if (onSubmit) {
      const submitData = onSubmit({ payload: form });
      if (submitData) {
        // allowSave.current = false;
        // const {onSuccess} = submitData || {};
        // // handle success
        // if (onSuccess) onSuccess(data);
        // return;

        uploadData({
          ...submitData,
          // override success
          onSuccess: (data) => {
            allowSave.current = false;
            const { onSuccess } = submitData || {};
            // handle success
            if (onSuccess) onSuccess(data);
          },
        });
      }
    }
  };

  // set default values from hook
  useEffect(() => {
    if (defaultValues && !data) updateFormValues(defaultValues);
  }, []);

  // editing the record
  // useEffect(() => {
  //   if (!title && id) {
  //     navigation.setOptions({
  //       title: `Edit ${capitalizeText(stringify(source))}`,
  //     });
  //   }
  // }, [id]);

  // drafts listener
  useDraftListener({
    form,
    setForm,
    source: _draftKey,
    id: draftId,
    allowSave,
    minSize: draftMinSize,
  });

  console.log("FORM:", form);

  // STEPPER
  if (steps?.length > 0) {
    return (
      <>
        {/* <SimpleButton onPress={handleSubmit}>Submit</SimpleButton> */}
        <StepperForm
          updateFormValues={updateFormValues}
          form={form}
          onChange={onChange}
          validateForm={validateForm}
          error={error}
          steps={steps}
          setError={setError}
          handleSubmit={handleSubmit}
          submitting={submitting}
          ignoreValidation={ignoreValidation}
          defaultStep={defaultStep}
          header={draftHeader}
        />
      </>
    );
  }
  const renderComponent = () => {
    if (sections?.length > 0) {
      return createForm(sections, form, updateFormValues, onChange, error);
    }

    return (
      <RenderForm
        fields={fields}
        form={form}
        error={error}
        updateFormValues={updateFormValues}
        onChange={onChange}
      />
    );
  };

  return (
    <View style={[styles.whiteBg, styles.flex1]}>
      {/* HEADER */}
      {draftHeader}
      <ScrollView>
        <View style={[styles.gap15, styles.p15, styles.flex1]}>
          {/* FORM */}
          {renderComponent()}
        </View>
      </ScrollView>

      {showSubmit && (
        <View
          style={[styles.p15, { borderTopColor: "#ddd", borderTopWidth: 0.5 }]}
        >
          <FormButton onPress={handleValidation} loading={submitting}>
            {submitText ? submitText : id ? "update" : "submit"}
          </FormButton>
        </View>
      )}
    </View>
  );
};

export default FormHandler;
