"""
This file contains implementation override of SearchResultProcessor which will allow
    * Blends in "location" property
    * Confirms user access to object
"""
from opaque_keys.edx.locations import SlashSeparatedCourseKey
from search.result_processor import SearchResultProcessor
from xmodule.modulestore.django import modulestore
from xmodule.modulestore.search import path_to_location

from courseware.access import has_access


class LmsSearchResultProcessor(SearchResultProcessor):

    """ SearchResultProcessor for LMS Search """
    _course_key = None
    _usage_key = None
    _module_store = None
    _module_temp_dictionary = {}

    def get_course_key(self):
        """ fetch course key object from string representation - retain result for subsequent uses """
        if self._course_key is None:
            self._course_key = SlashSeparatedCourseKey.from_deprecated_string(self._results_fields["course"])
        return self._course_key

    def get_usage_key(self):
        """ fetch usage key for component from string representation - retain result for subsequent uses """
        if self._usage_key is None:
            self._usage_key = self.get_course_key().make_usage_key_from_deprecated_string(self._results_fields["id"])
        return self._usage_key

    def get_module_store(self):
        """ module store accessor - retain result for subsequent uses """
        if self._module_store is None:
            self._module_store = modulestore()
        return self._module_store

    def get_item(self, usage_key):
        """ fetch item from the modulestore - don't refetch if we've already retrieved it beforehand """
        if usage_key not in self._module_temp_dictionary:
            self._module_temp_dictionary[usage_key] = self.get_module_store().get_item(usage_key)
        return self._module_temp_dictionary[usage_key]

    @property
    def location(self):
        """
        Blend "location" property into the resultset, so that the path to the found component can be shown within the UI
        """
        # TODO: update whern changes to "cohorted-courseware" branch are merged in
        (course_key, chapter, section, position) = path_to_location(self.get_module_store(), self.get_usage_key())

        def get_display_name(category, item_id):
            """ helper to get display name from object """
            item = self.get_item(course_key.make_usage_key(category, item_id))
            return getattr(item, "display_name", None)

        def get_position_name(section, position):
            """ helper to fetch name corresponding to the position therein """
            pos = int(position)
            section_item = self.get_item(course_key.make_usage_key('sequential', section))
            if section_item.has_children and len(section_item.children) >= pos:
                item = self.get_item(section_item.children[pos - 1])
                return getattr(item, "display_name", None)
            return None

        location_description = []
        if chapter:
            location_description.append(get_display_name('chapter', chapter))
        if section:
            location_description.append(get_display_name('sequential', section))
        if position:
            location_description.append(get_position_name(section, position))

        return location_description

    def should_remove(self, user):
        """ Test to see if this result should be removed due to access restriction """
        return has_access(
            user,
            'load',
            self.get_item(self.get_usage_key()),
            self.get_course_key()
        ) is False
