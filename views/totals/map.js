function (doc) {
  if (doc.points) {
      emit(doc.driver, doc.points);
  }
}